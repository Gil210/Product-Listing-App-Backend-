const { body } = require('express-validator');
const Message = require('../models/Message');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { messagePopulation, accessibleMessage, markMessagesRead } = require('../services/messageService');

const createMessageRules = [body('property').isMongoId().withMessage('A valid property is required'), body('subject').trim().notEmpty().withMessage('Subject is required'), body('message').trim().notEmpty().withMessage('Message is required')];
const createMessage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.property);
  if (!property) throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  if (String(property.owner) === String(req.user._id)) throw Object.assign(new Error('You cannot message yourself'), { statusCode: 400 });
  const message = new Message({ sender: req.user._id, receiver: property.owner, property: property._id, subject: req.body.subject, message: req.body.message });
  message.threadId = message._id;
  await message.save();
  success(res, 201, 'Message sent successfully', await messagePopulation(Message.findById(message._id)));
});
const sentMessages = asyncHandler(async (req, res) => success(res, 200, 'Sent messages retrieved successfully', await messagePopulation(Message.find({ sender: req.user._id }).sort('-createdAt'))));
const receivedMessages = asyncHandler(async (req, res) => success(res, 200, 'Received messages retrieved successfully', await messagePopulation(Message.find({ receiver: req.user._id }).sort('-createdAt'))));
const getMessage = asyncHandler(async (req, res) => {
  const message = await accessibleMessage(req.params.id, req.user._id);
  if (String(message.receiver._id) === String(req.user._id)) {
    await markMessagesRead({ _id: message._id }, req.user._id);
    message.isRead = true;
  }
  success(res, 200, 'Message retrieved successfully', message);
});
const markRead = asyncHandler(async (req, res) => { const message = await accessibleMessage(req.params.id, req.user._id); if (String(message.receiver._id) !== String(req.user._id)) throw Object.assign(new Error('Only the receiver can mark a message as read'), { statusCode: 403 }); message.isRead = true; await message.save(); success(res, 200, 'Message marked as read', message); });

const replyRules = [body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters')];
const adminMessages = asyncHandler(async (_req, res) => success(res, 200, 'Messages retrieved successfully', await messagePopulation(Message.find({ parentMessage: { $exists: false } }).sort('-createdAt'))));
const getThread = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw Object.assign(new Error('Message not found'), { statusCode: 404 });
  const threadId = message.threadId || message._id;
  const root = await Message.findById(threadId);
  if (!root) throw Object.assign(new Error('Message thread not found'), { statusCode: 404 });
  const isParticipant = [root.sender, root.receiver].some((participant) => String(participant) === String(req.user._id));
  if (req.user.role !== 'admin' && !isParticipant) throw Object.assign(new Error('You are not authorized to access this message thread'), { statusCode: 403 });
  const threadQuery = { $or: [{ threadId }, { _id: threadId }] };
  await markMessagesRead(threadQuery, req.user._id);
  success(res, 200, 'Message thread retrieved successfully', await messagePopulation(Message.find(threadQuery).sort('createdAt')));
});
const replyToMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw Object.assign(new Error('Message not found'), { statusCode: 404 });
  const threadId = message.threadId || message._id;
  const root = await Message.findById(threadId);
  if (!root) throw Object.assign(new Error('Message thread not found'), { statusCode: 404 });
  const isSender = String(root.sender) === String(req.user._id);
  const isReceiver = String(root.receiver) === String(req.user._id);
  if (req.user.role !== 'admin' && !isSender && !isReceiver) throw Object.assign(new Error('You are not authorized to reply to this message'), { statusCode: 403 });
  const receiver = isSender ? root.receiver : root.sender;
  const reply = await Message.create({
    sender: req.user._id,
    receiver,
    property: root.property,
    threadId,
    parentMessage: message._id,
    subject: root.subject,
    message: req.body.message
  });
  success(res, 201, 'Reply sent successfully', await messagePopulation(Message.findById(reply._id)));
});

module.exports = { createMessageRules, createMessage, sentMessages, receivedMessages, getMessage, markRead, replyRules, adminMessages, getThread, replyToMessage };

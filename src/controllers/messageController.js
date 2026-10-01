const { body } = require('express-validator');
const Message = require('../models/Message');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { messagePopulation, accessibleMessage } = require('../services/messageService');

const createMessageRules = [body('property').isMongoId().withMessage('A valid property is required'), body('subject').trim().notEmpty().withMessage('Subject is required'), body('message').trim().notEmpty().withMessage('Message is required')];
const createMessage = asyncHandler(async (req, res) => { const property = await Property.findById(req.body.property); if (!property) throw Object.assign(new Error('Property not found'), { statusCode: 404 }); if (String(property.owner) === String(req.user._id)) throw Object.assign(new Error('You cannot message yourself'), { statusCode: 400 }); const message = await Message.create({ sender: req.user._id, receiver: property.owner, property: property._id, subject: req.body.subject, message: req.body.message }); success(res, 201, 'Message sent successfully', await messagePopulation(Message.findById(message._id))); });
const sentMessages = asyncHandler(async (req, res) => success(res, 200, 'Sent messages retrieved successfully', await messagePopulation(Message.find({ sender: req.user._id }).sort('-createdAt'))));
const receivedMessages = asyncHandler(async (req, res) => success(res, 200, 'Received messages retrieved successfully', await messagePopulation(Message.find({ receiver: req.user._id }).sort('-createdAt'))));
const getMessage = asyncHandler(async (req, res) => success(res, 200, 'Message retrieved successfully', await accessibleMessage(req.params.id, req.user._id)));
const markRead = asyncHandler(async (req, res) => { const message = await accessibleMessage(req.params.id, req.user._id); if (String(message.receiver._id) !== String(req.user._id)) throw Object.assign(new Error('Only the receiver can mark a message as read'), { statusCode: 403 }); message.isRead = true; await message.save(); success(res, 200, 'Message marked as read', message); });

module.exports = { createMessageRules, createMessage, sentMessages, receivedMessages, getMessage, markRead };

const Message = require('../models/Message');

const messagePopulation = (query) => query.populate('sender', 'name email').populate('receiver', 'name email').populate('property', 'title city price');

const accessibleMessage = async (id, userId) => {
  const message = await messagePopulation(Message.findOne({ _id: id, $or: [{ sender: userId }, { receiver: userId }] }));
  if (!message) throw Object.assign(new Error('Message not found'), { statusCode: 404 });
  return message;
};

const markMessagesRead = (query, userId) => Message.updateMany(
  { ...query, receiver: userId, isRead: false },
  { $set: { isRead: true } }
);

module.exports = { messagePopulation, accessibleMessage, markMessagesRead };

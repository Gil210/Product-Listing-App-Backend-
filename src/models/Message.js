const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ threadId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);

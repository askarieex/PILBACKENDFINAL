// backend/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the message'],
  },
  content: {
    type: String,
    required: [true, 'Please add content for the message'],
  },
  sentBy: {
    type: String,
    required: [true, 'Please specify who sent the message'],
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Parents', 'Boys', 'Girls', 'Specific Class'],
    default: 'All',
    required: [true, 'Please specify the target audience'],
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);

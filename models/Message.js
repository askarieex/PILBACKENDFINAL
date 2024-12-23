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
    enum: [
      'All',
      'Parents',
      'Boys',
      'Girls',
      'Nursery',
      'LKG',
      'UKG',
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
      '10th',
    ],
    default: 'All',
    required: [true, 'Please specify the target audience'],
  },
  attachment: {
    type: String, // URL or path to the uploaded file
    default: '',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);

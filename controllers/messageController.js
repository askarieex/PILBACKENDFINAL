// backend/controllers/messageController.js

const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get all messages
 * @route   GET /api/admin/messages
 * @access  Private/Admin
 */
const getAllMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ sentAt: -1 });
  res.status(200).json({ success: true, data: messages });
});

/**
 * @desc    Create a new message
 * @route   POST /api/admin/messages
 * @access  Private/Admin
 */
const createMessage = asyncHandler(async (req, res) => {
  const { title, content, sentBy, targetAudience } = req.body;

  if (!title || !content || !sentBy || !targetAudience) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const newMessage = await Message.create({
    title,
    content,
    sentBy,
    targetAudience,
    sentAt: Date.now(),
  });

  res.status(201).json({ success: true, data: newMessage });
});

/**
 * @desc    Update a message
 * @route   PUT /api/admin/messages/:id
 * @access  Private/Admin
 */
const updateMessage = asyncHandler(async (req, res) => {
  const { title, content, sentBy, targetAudience } = req.body;
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.title = title || message.title;
  message.content = content || message.content;
  message.sentBy = sentBy || message.sentBy;
  message.targetAudience = targetAudience || message.targetAudience;

  await message.save();

  res.status(200).json({ success: true, data: message });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/admin/messages/:id
 * @access  Private/Admin
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await Message.findByIdAndDelete(req.params.id); // Corrected method

  res.status(200).json({ success: true, message: 'Message deleted successfully' });
});

module.exports = {
  getAllMessages,
  createMessage,
  updateMessage,
  deleteMessage,
};

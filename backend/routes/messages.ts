import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages,
} from '../controllers/messageController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
router.get(
  '/conversations',
  validate({ query: schemas.pagination }),
  getConversations
);

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
router.get(
  '/search',
  validate({ query: schemas.pagination }),
  searchMessages
);

// @desc    Get messages with specific user
// @route   GET /api/messages/conversation/:otherUserId
// @access  Private
router.get(
  '/conversation/:otherUserId',
  validate({
    params: { otherUserId: schemas.idParam.shape.id },
    query: schemas.pagination,
  }),
  getMessages
);

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post(
  '/',
  validate({ body: schemas.sendMessage }),
  sendMessage
);

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
router.put('/read', markMessagesAsRead);

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete(
  '/:id',
  validate({ params: schemas.idParam }),
  deleteMessage
);

export default router;

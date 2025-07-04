import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { Server } from 'socket.io';

// Get conversations for user
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Get unique conversations by finding messages where user is sender or receiver
  const conversations = await prisma.$queryRaw`
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id = ${userId} THEN m.receiver_id
        ELSE m.sender_id
      END as other_user_id,
      MAX(m.created_at) as last_message_time,
      COUNT(CASE WHEN m.receiver_id = ${userId} AND m.is_read = false THEN 1 END) as unread_count
    FROM messages m
    WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
    GROUP BY other_user_id
    ORDER BY last_message_time DESC
    LIMIT ${limit} OFFSET ${skip}
  ` as any[];

  // Get user details for each conversation
  const conversationsWithUsers = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser = await prisma.user.findUnique({
        where: { id: conv.other_user_id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          onlineStatus: true,
          role: true,
        },
      });

      // Get last message
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: conv.other_user_id },
            { senderId: conv.other_user_id, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          content: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      });

      return {
        otherUser,
        lastMessage,
        unreadCount: Number(conv.unread_count),
        lastMessageTime: conv.last_message_time,
      };
    })
  );

  res.json({
    success: true,
    data: {
      conversations: conversationsWithUsers,
      pagination: {
        page,
        limit,
        hasMore: conversations.length === limit,
      },
    },
  });
});

// Get messages between two users
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { otherUserId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  // Verify other user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, firstName: true, lastName: true, avatar: true },
  });

  if (!otherUser) {
    throw createError('User not found', 404);
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        appointment: {
          select: {
            id: true,
            listing: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    }),
  ]);

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Reverse to show oldest first
      otherUser,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Send message
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { receiverId, content, appointmentId } = req.body;

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!receiver) {
    throw createError('Receiver not found', 404);
  }

  // Verify appointment if provided
  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    // Check if user is part of the appointment
    if (appointment.customerId !== userId && appointment.professionalId !== userId) {
      throw createError('Not authorized to message about this appointment', 403);
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      content,
      appointmentId,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      appointment: {
        select: {
          id: true,
          listing: {
            select: { title: true },
          },
        },
      },
    },
  });

  // Create notification for receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'MESSAGE_RECEIVED',
      title: 'New Message',
      content: `You have a new message from ${message.sender.firstName} ${message.sender.lastName}`,
    },
  });

  // Emit real-time message via Socket.IO
  const io: Server = (req as any).io;
  if (io) {
    io.to(`user_${receiverId}`).emit('new_message', {
      message,
      sender: message.sender,
    });

    // Also emit to sender for confirmation
    io.to(`user_${userId}`).emit('message_sent', {
      message,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

// Mark messages as read
export const markMessagesAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { senderId } = req.body;

  await prisma.message.updateMany({
    where: {
      senderId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({
    success: true,
    message: 'Messages marked as read',
  });
});

// Delete message
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw createError('Message not found', 404);
  }

  // Only sender can delete their message
  if (message.senderId !== userId) {
    throw createError('Not authorized to delete this message', 403);
  }

  await prisma.message.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Message deleted successfully',
  });
});

// Get unread message count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const unreadCount = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });

  res.json({
    success: true,
    data: { unreadCount },
  });
});

// Search messages
export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { query, otherUserId } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (!query) {
    throw createError('Search query is required', 400);
  }

  const where: any = {
    content: {
      contains: query as string,
      mode: 'insensitive',
    },
    OR: [
      { senderId: userId },
      { receiverId: userId },
    ],
  };

  // Filter by specific conversation if provided
  if (otherUserId) {
    where.OR = [
      { senderId: userId, receiverId: otherUserId as string },
      { senderId: otherUserId as string, receiverId: userId },
    ];
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

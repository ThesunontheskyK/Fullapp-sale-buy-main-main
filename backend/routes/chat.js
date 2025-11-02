const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSlip, uploadChatImage } = require('../middleware/upload');
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const Transaction = require('../models/Transaction');

// @route   POST /api/chat/rooms
// @desc    สร้างห้องแชทใหม่
// @access  Private
router.post('/rooms', protect, async (req, res, next) => {
  try {
    const { otherUserId, role, productInfo } = req.body;

    // ตรวจสอบข้อมูล
    if (!otherUserId || !role) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุผู้ใช้อีกฝ่ายและบทบาท'
      });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'บทบาทต้องเป็น buyer หรือ seller เท่านั้น'
      });
    }

    // กำหนด buyer และ seller ตาม role ที่เลือก
    const buyer = role === 'buyer' ? req.user.id : otherUserId;
    const seller = role === 'seller' ? req.user.id : otherUserId;

    // ตรวจสอบว่ามีห้องแชทระหว่าง 2 คนนี้อยู่แล้วหรือไม่
    let chatRoom = await ChatRoom.findOne({
      buyer: buyer,
      seller: seller,
      status: 'active'
    });

    if (chatRoom) {
      return res.status(200).json({
        success: true,
        message: 'มีห้องแชทอยู่แล้ว',
        data: { chatRoom }
      });
    }

    // สร้างห้องแชทใหม่
    chatRoom = await ChatRoom.create({
      buyer,
      seller,
      productInfo: productInfo || {},
      status: 'active'
    });

    // Populate ข้อมูล user
    await chatRoom.populate('buyer seller', 'username email fullName profileImage');

    res.status(201).json({
      success: true,
      message: 'สร้างห้องแชทสำเร็จ',
      data: { chatRoom }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/rooms
// @desc    ดึงรายการห้องแชททั้งหมดของผู้ใช้
// @access  Private
router.get('/rooms', protect, async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    })
      .populate('buyer seller', 'username email fullName profileImage')
      .populate('lastMessage.sender', 'username')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { chatRooms }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/rooms/:roomId
// @desc    ดึงข้อมูลห้องแชท
// @access  Private
router.get('/rooms/:roomId', protect, async (req, res, next) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId)
      .populate('buyer seller', 'username email fullName profileImage');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (
      chatRoom.buyer._id.toString() !== req.user.id &&
      chatRoom.seller._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    res.status(200).json({
      success: true,
      data: { chatRoom }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/rooms/:roomId/messages
// @desc    ส่งข้อความในห้องแชท
// @access  Private
router.post('/rooms/:roomId/messages', protect, async (req, res, next) => {
  try {
    const { message, messageType } = req.body;
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    const isBuyer = chatRoom.buyer.toString() === req.user.id;
    const isSeller = chatRoom.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ส่งข้อความในห้องแชทนี้'
      });
    }

    // กำหนด role ของผู้ส่ง
    const senderRole = isBuyer ? 'buyer' : 'seller';

    // สร้างข้อความใหม่
    const chatMessage = await ChatMessage.create({
      chatRoom: roomId,
      sender: req.user.id,
      senderRole,
      message,
      messageType: messageType || 'text'
    });

    // อัพเดทข้อความล่าสุดในห้องแชท
    chatRoom.lastMessage = {
      message,
      sender: req.user.id,
      timestamp: new Date()
    };

    // เพิ่มจำนวนข้อความที่ยังไม่ได้อ่านของอีกฝ่าย
    if (isBuyer) {
      chatRoom.unreadCount.seller += 1;
    } else {
      chatRoom.unreadCount.buyer += 1;
    }

    await chatRoom.save();

    // Populate ข้อมูลผู้ส่ง
    await chatMessage.populate('sender', 'username fullName profileImage');

    res.status(201).json({
      success: true,
      message: 'ส่งข้อความสำเร็จ',
      data: { chatMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/rooms/:roomId/messages/upload
// @desc    ส่งข้อความพร้อมรูปภาพในห้องแชท
// @access  Private
router.post('/rooms/:roomId/messages/upload', protect, uploadChatImage, async (req, res, next) => {
  try {
    const { message } = req.body;
    const roomId = req.params.roomId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดรูปภาพ'
      });
    }

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    const isBuyer = chatRoom.buyer.toString() === req.user.id;
    const isSeller = chatRoom.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ส่งข้อความในห้องแชทนี้'
      });
    }

    // กำหนด role ของผู้ส่ง
    const senderRole = isBuyer ? 'buyer' : 'seller';

    // สร้าง URL ของรูปภาพ
    const imageUrl = `/uploads/chat/${req.file.filename}`;

    // สร้างข้อความใหม่
    const chatMessage = await ChatMessage.create({
      chatRoom: roomId,
      sender: req.user.id,
      senderRole,
      message: message || '',
      messageType: 'image',
      attachments: [{
        url: imageUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }]
    });

    // อัพเดทข้อความล่าสุดในห้องแชท
    chatRoom.lastMessage = {
      message: message || '[รูปภาพ]',
      sender: req.user.id,
      timestamp: new Date()
    };

    // เพิ่มจำนวนข้อความที่ยังไม่ได้อ่านของอีกฝ่าย
    if (isBuyer) {
      chatRoom.unreadCount.seller += 1;
    } else {
      chatRoom.unreadCount.buyer += 1;
    }

    await chatRoom.save();

    // Populate ข้อมูลผู้ส่ง
    await chatMessage.populate('sender', 'username fullName profileImage');

    res.status(201).json({
      success: true,
      message: 'ส่งรูปภาพสำเร็จ',
      data: { chatMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/rooms/:roomId/messages
// @desc    ดึงข้อความทั้งหมดในห้องแชท
// @access  Private
router.get('/rooms/:roomId/messages', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const { page = 1, limit = 50 } = req.query;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (
      chatRoom.buyer.toString() !== req.user.id &&
      chatRoom.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // ดึงข้อความ
    const messages = await ChatMessage.find({ chatRoom: roomId })
      .populate('sender', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // นับจำนวนข้อความทั้งหมด
    const count = await ChatMessage.countDocuments({ chatRoom: roomId });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // กลับลำดับเพื่อให้ข้อความเก่าอยู่ข้างบน
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalMessages: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/chat/rooms/:roomId/read
// @desc    อ่านข้อความทั้งหมดในห้องแชท
// @access  Private
router.put('/rooms/:roomId/read', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    const isBuyer = chatRoom.buyer.toString() === req.user.id;
    const isSeller = chatRoom.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // รีเซ็ตจำนวนข้อความที่ยังไม่ได้อ่าน
    if (isBuyer) {
      chatRoom.unreadCount.buyer = 0;
    } else {
      chatRoom.unreadCount.seller = 0;
    }

    await chatRoom.save();

    // อัพเดทสถานะข้อความที่ยังไม่ได้อ่าน
    await ChatMessage.updateMany(
      {
        chatRoom: roomId,
        sender: { $ne: req.user.id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'อ่านข้อความทั้งหมดแล้ว'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/transactions
// @desc    สร้างธุรกรรมและอัพโหลดสลิป
// @access  Private
router.post('/transactions', protect, uploadSlip, async (req, res, next) => {
  try {
    const { chatRoomId, productName, productDescription, quantity, amount, notes, paymentMethod, bankName, accountNumber, transferDate, referenceNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดสลิปการโอนเงิน'
      });
    }

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (
      chatRoom.buyer.toString() !== req.user.id &&
      chatRoom.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์สร้างธุรกรรมในห้องแชทนี้'
      });
    }

    // สร้าง URL ของสลิป
    const slipUrl = `/uploads/slips/${req.file.filename}`;

    // สร้างธุรกรรม
    const transaction = await Transaction.create({
      chatRoom: chatRoomId,
      buyer: chatRoom.buyer,
      seller: chatRoom.seller,
      productInfo: {
        name: productName,
        description: productDescription,
        quantity: quantity || 1
      },
      amount,
      paymentSlip: {
        url: slipUrl,
        fileName: req.file.originalname,
        uploadedAt: new Date()
      },
      notes,
      metadata: {
        paymentMethod: paymentMethod || 'bank_transfer',
        bankName,
        accountNumber,
        transferDate: transferDate ? new Date(transferDate) : new Date(),
        referenceNumber
      },
      statusHistory: [{
        status: 'pending',
        updatedBy: req.user.id,
        updatedAt: new Date(),
        reason: 'สร้างธุรกรรมและอัพโหลดสลิป'
      }]
    });

    // สร้างข้อความในแชทเพื่อแจ้งเตือน
    const isBuyer = chatRoom.buyer.toString() === req.user.id;
    const senderRole = isBuyer ? 'buyer' : 'seller';

    const chatMessage = await ChatMessage.create({
      chatRoom: chatRoomId,
      sender: req.user.id,
      senderRole,
      message: `อัพโหลดสลิปการโอนเงิน จำนวน ${amount} บาท`,
      messageType: 'slip',
      attachments: [{
        url: slipUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }],
      transactionInfo: {
        amount,
        status: 'pending'
      }
    });

    // อัพเดทข้อความล่าสุดในห้องแชท
    chatRoom.lastMessage = {
      message: `[สลิปการโอนเงิน ${amount} บาท]`,
      sender: req.user.id,
      timestamp: new Date()
    };

    // เพิ่มจำนวนข้อความที่ยังไม่ได้อ่านของอีกฝ่าย
    if (isBuyer) {
      chatRoom.unreadCount.seller += 1;
    } else {
      chatRoom.unreadCount.buyer += 1;
    }

    await chatRoom.save();

    // Populate ข้อมูล
    await transaction.populate('buyer seller', 'username email fullName');

    res.status(201).json({
      success: true,
      message: 'สร้างธุรกรรมสำเร็จ',
      data: { transaction, chatMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/transactions/:transactionId
// @desc    ดึงข้อมูลธุรกรรม
// @access  Private
router.get('/transactions/:transactionId', protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('buyer seller', 'username email fullName profileImage')
      .populate('chatRoom');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบธุรกรรม'
      });
    }

    // ตรวจสอบสิทธิ์
    if (
      transaction.buyer._id.toString() !== req.user.id &&
      transaction.seller._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงธุรกรรมนี้'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/chat/transactions/:transactionId/status
// @desc    อัพเดทสถานะธุรกรรม
// @access  Private
router.put('/transactions/:transactionId/status', protect, async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบธุรกรรม'
      });
    }

    // ตรวจสอบสิทธิ์
    if (
      transaction.buyer.toString() !== req.user.id &&
      transaction.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขธุรกรรมนี้'
      });
    }

    // อัพเดทสถานะ
    transaction.status = status;

    // บันทึกประวัติการเปลี่ยนสถานะ
    transaction.statusHistory.push({
      status,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      reason
    });

    // อัพเดทวันที่ตามสถานะ
    if (status === 'confirmed') {
      transaction.confirmedAt = new Date();
    } else if (status === 'completed') {
      transaction.completedAt = new Date();
    }

    await transaction.save();

    // อัพเดทข้อความในแชทที่เกี่ยวข้อง
    await ChatMessage.updateMany(
      {
        chatRoom: transaction.chatRoom,
        'transactionInfo.amount': transaction.amount
      },
      {
        'transactionInfo.status': status
      }
    );

    await transaction.populate('buyer seller', 'username email fullName');

    res.status(200).json({
      success: true,
      message: 'อัพเดทสถานะธุรกรรมสำเร็จ',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/rooms/:roomId/transactions
// @desc    ดึงธุรกรรมทั้งหมดในห้องแชท
// @access  Private
router.get('/rooms/:roomId/transactions', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบสิทธิ์
    if (
      chatRoom.buyer.toString() !== req.user.id &&
      chatRoom.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
      });
    }

    // ดึงธุรกรรม
    const transactions = await Transaction.find({ chatRoom: roomId })
      .populate('buyer seller', 'username email fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

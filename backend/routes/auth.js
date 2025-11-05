const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// สร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    ลงทะเบียนผู้ใช้ใหม่
// @access  Public

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

    // ตรวจสอบข้อมูล
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ตรวจสอบว่ามี username หรือ email นี้แล้วหรือไม่
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username หรือ Email นี้มีอยู่ในระบบแล้ว'
      });
    }

    // สร้าง user ใหม่
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      phoneNumber
    });

    // สร้าง token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    เข้าสู่ระบบ
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบข้อมูล
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก email และ password'
      });
    }

    // หา user และเลือก password ด้วย
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email หรือ Password ไม่ถูกต้อง'
      });
    }

    // ตรวจสอบ password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email หรือ Password ไม่ถูกต้อง'
      });
    }

    // สร้าง token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    ดึงข้อมูลผู้ใช้ปัจจุบัน
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});


// @route   PUT /api/auth/update-profile
// @desc    อัพเดทข้อมูลส่วนตัว
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
  try {
    const { fullName, phoneNumber, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phoneNumber, profileImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    เปลี่ยนรหัสผ่าน
// @access  Private
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // ตรวจสอบรหัสผ่านเดิม
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านเดิมไม่ถูกต้อง'
      });
    }

    // เปลี่ยนรหัสผ่าน
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

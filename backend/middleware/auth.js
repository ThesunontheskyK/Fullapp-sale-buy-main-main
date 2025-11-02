const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ป้องกัน routes ที่ต้อง login ก่อน
exports.protect = async (req, res, next) => {
  let token;

  // ตรวจสอบ token จาก Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // ตรวจสอบว่ามี token หรือไม่
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'กรุณา login ก่อนเข้าใช้งาน'
    });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // เพิ่ม user ใน request
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    });
  }
};

// ตรวจสอบ role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} ไม่มีสิทธิ์เข้าถึง`
      });
    }
    next();
  };
};

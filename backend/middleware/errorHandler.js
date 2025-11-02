const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log สำหรับ developer
  console.error(err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} นี้มีอยู่ในระบบแล้ว`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'ไม่พบข้อมูล';
    error = { message, statusCode: 404 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์'
  });
};

module.exports = errorHandler;

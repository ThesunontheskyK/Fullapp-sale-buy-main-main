const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'กรุณากรอก username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร']
  },
  email: {
    type: String,
    required: [true, 'กรุณากรอกอีเมล'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'กรุณากรอกอีเมลที่ถูกต้อง'
    ]
  },
  password: {
    type: String,
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
    select: false // ไม่ return password ตอน query
  },
  fullName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  Creadit:{
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password ก่อนบันทึก
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// เปรียบเทียบรหัสผ่าน
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

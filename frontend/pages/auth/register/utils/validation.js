
export const validateFullname = (fullname) => {
  return fullname.trim().length >= 2;
};

export const validatePhone = (phone) => {
  const phonePattern = /^[0-9]{10}$/;
  return phonePattern.test(phone.trim());
};

export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
};

export const validatePassword = (password) => {
  
  if (!password.trim()) return false;
  // รองรับตัวอักษรพิเศษ เช่น @#$%^&* ฯลฯ
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordPattern.test(password);
};

export const checkPasswordLength = (password) => password.length >= 8;
export const checkPasswordUpperCase = (password) => /[A-Z]/.test(password);
export const checkPasswordLowerCase = (password) => /[a-z]/.test(password);
export const checkPasswordNumber = (password) => /\d/.test(password);
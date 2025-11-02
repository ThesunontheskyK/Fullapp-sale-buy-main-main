import api from '../config/api';
import { setItem, getItem, deleteItem } from '../storage';

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้ { fullname, email, password, phone }
 * @returns {Promise<Object>} - Response data
 */
export const register = async (userData) => {
  try {
    // แปลงชื่อ field ให้ตรงกับ backend
    const requestData = {
      username: userData.email, // ใช้ email เป็น username
      email: userData.email,
      password: userData.password,
      fullName: userData.fullname, // แปลง fullname -> fullName
      phoneNumber: userData.phone // แปลง phone -> phoneNumber
    };

    const response = await api.post('/auth/register', requestData);

    if (response.data.success) {
      // บันทึก token และ user data
      const { token, user } = response.data.data;
      await setItem('token', token);
      await setItem('user_id', user.id.toString());
      await setItem('user_email', user.email);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      message: response.data.message || 'เกิดข้อผิดพลาด'
    };
  } catch (error) {
    console.error('Register error:', error);

    // จัดการ error message
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';

    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * เข้าสู่ระบบ
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - Response data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);

    if (response.data.success) {
      // บันทึก token และ user data
      const { token, user } = response.data.data;
      await setItem('token', token);
      await setItem('user_id', user.id.toString());
      await setItem('user_email', user.email);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      message: response.data.message || 'เกิดข้อผิดพลาด'
    };
  } catch (error) {
    console.error('Login error:', error);

    // จัดการ error message
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';

    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * ออกจากระบบ
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await deleteItem('token');
    await deleteItem('user_id');
    await deleteItem('user_email');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * ตรวจสอบว่าผู้ใช้ login อยู่หรือไม่
 * @returns {Promise<boolean>}
 */
export const isLoggedIn = async () => {
  try {
    const token = await getItem('token');
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * ดึงข้อมูล token
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    return await getItem('token');
  } catch (error) {
    return null;
  }
};

/**
 * ดึงข้อมูล user ID
 * @returns {Promise<string|null>}
 */
export const getUserId = async () => {
  try {
    return await getItem('user_id');
  } catch (error) {
    return null;
  }
};

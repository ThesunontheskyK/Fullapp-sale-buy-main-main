import axios from 'axios';
import { Platform } from 'react-native';


const getApiUrl = () => {

  const CUSTOM_IP = 'http://10.197.195.216:5000/api';

  if (CUSTOM_IP) {
    return CUSTOM_IP;
  }

  if (Platform.OS === 'android') {

    return 'http://10.197.195.216:5000/api';
  } else if (Platform.OS === 'ios') {
    // iOS Simulator ใช้ localhost ได้
    return 'http://localhost:5000/api';
  } else {
    // Web ใช้ localhost
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiUrl();

// แสดง URL ที่ใช้งาน (สำหรับ debug)
console.log('API Base URL:', API_BASE_URL);

// สร้าง axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - เพิ่ม token ในทุก request (ถ้ามี)
api.interceptors.request.use(
  async (config) => {
    try {
      const { getItem } = require('../storage');
      const token = await getItem('token');
      if (token) {
        // config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - จัดการ response และ error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      // console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      // console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      // console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

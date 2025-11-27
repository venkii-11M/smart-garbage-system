import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator use: http://10.0.2.2:5000/api
// For physical device use your computer's IP: http://10.150.123.154:5000/api
const getApiUrl = () => {

  const COMPUTER_IP = '10.0.2.2';
  
  if (Platform.OS === 'android') {

    return `http://${COMPUTER_IP}:5000/api`;
  } else {
  
    return `http://${COMPUTER_IP}:5000/api`;
  }
};

const API_URL = getApiUrl();

// Add axios timeout and retry configuration
axios.defaults.timeout = 30000; // 30 seconds timeout

export const submitGarbageReport = async (reportData) => {
  try {
    console.log('Submitting report to:', `${API_URL}/garbage/report`);
    
    const formData = new FormData();
    
    // Ensure photo data is properly formatted
    const photoData = {
      uri: reportData.photo.uri,
      type: reportData.photo.type || 'image/jpeg',
      name: reportData.photo.fileName || `photo_${Date.now()}.jpg`
    };
    
    console.log('Photo data:', photoData);
    formData.append('photo', photoData);
    
    formData.append('userId', reportData.userId);
    formData.append('userName', reportData.userName);
    formData.append('userPhone', reportData.userPhone);
    formData.append('userAddress', reportData.userAddress || '');
    formData.append('description', reportData.description || '');
    formData.append('latitude', String(reportData.latitude));
    formData.append('longitude', String(reportData.longitude));
    formData.append('address', reportData.address);

    const response = await axios.post(`${API_URL}/garbage/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    // Provide more specific error messages
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw new Error('Network connection failed. Please check your internet connection and ensure the server is running.');
    } else if (error.response?.status === 404) {
      throw new Error('Server endpoint not found. Please check if the backend server is running.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error occurred. Please try again later.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('Failed to submit report. Please try again.');
    }
  }
};
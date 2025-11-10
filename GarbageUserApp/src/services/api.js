import axios from 'axios';

// For Android Emulator use: http://10.0.2.2:5000/api
// For physical device use your computer's IP: http://192.168.x.x:5000/api
const API_URL = 'http://10.21.185.154:5000/api';

export const submitGarbageReport = async (reportData) => {
  try {
    const formData = new FormData();
    
    formData.append('photo', {
      uri: reportData.photo.uri,
      type: reportData.photo.type || 'image/jpeg',
      name: reportData.photo.fileName || 'photo.jpg'
    });
    
    formData.append('userId', reportData.userId);
    formData.append('userName', reportData.userName);
    formData.append('userPhone', reportData.userPhone);
    formData.append('userAddress', reportData.userAddress);
    formData.append('description', reportData.description);
    formData.append('latitude', reportData.latitude);
    formData.append('longitude', reportData.longitude);
    formData.append('address', reportData.address);

    const response = await axios.post(`${API_URL}/garbage/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
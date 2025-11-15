import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Dynamic API URL configuration
const getApiUrl = () => {
  // Your computer's actual IP address
  const COMPUTER_IP = '10.0.2.2'; // Your computer's IP address
  
  if (Platform.OS === 'android') {
    // For physical devices, use computer's IP
    return `http://${COMPUTER_IP}:5000/api`;
  } else {
    // For iOS physical devices, use computer's IP
    return `http://${COMPUTER_IP}:5000/api`;
  }
};

const API_URL = getApiUrl();

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/login/user`, {
        email,
        password
      });

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }

      throw new Error(response.data.error || 'Login failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(name: string, phone: string, email: string, password: string, address: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/register/user`, {
        name,
        phone,
        email,
        password,
        address
      });

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }

      throw new Error(response.data.error || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export default new AuthService();
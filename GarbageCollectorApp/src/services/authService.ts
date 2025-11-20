import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

interface Collector {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  area: string;
  totalCollected: number;
}

class AuthService {
  async login(email: string, password: string): Promise<Collector> {
    try {
      const response = await axios.post(`${API_URL}/auth/login/collector`, {
        email,
        password
      });

      if (response.data.success) {
        await AsyncStorage.setItem('collector', JSON.stringify(response.data.collector));
        return response.data.collector;
      }

      throw new Error(response.data.error || 'Login failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(data: any): Promise<Collector> {
    try {
      const response = await axios.post(`${API_URL}/auth/register/collector`, data);

      if (response.data.success) {
        await AsyncStorage.setItem('collector', JSON.stringify(response.data.collector));
        return response.data.collector;
      }

      throw new Error(response.data.error || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('collector');
  }

  async getCurrentCollector(): Promise<Collector | null> {
    const collectorStr = await AsyncStorage.getItem('collector');
    return collectorStr ? JSON.parse(collectorStr) : null;
  }

  async isLoggedIn(): Promise<boolean> {
    const collector = await this.getCurrentCollector();
    return collector !== null;
  }
}

export default new AuthService();
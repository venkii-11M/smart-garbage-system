import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export interface GarbageReport {
  _id: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  photoUrl: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  status: 'pending' | 'assigned' | 'collected';
  collectorId?: string;
  collectorName?: string;
  createdAt: string;
  assignedAt?: string;
  collectedAt?: string;
}

export const api = {
  getPendingReports: async (): Promise<GarbageReport[]> => {
    const response = await axios.get(`${API_URL}/garbage/pending`);
    return response.data.reports || [];
  },

  getCollectorTasks: async (collectorId: string, status?: string): Promise<GarbageReport[]> => {
    let url = `${API_URL}/garbage/collector/${collectorId}/tasks`;
    if (status) {
      url += `?status=${status}`;
    }
    const response = await axios.get(url);
    return response.data.tasks || [];
  },

  acceptTask: async (reportId: string, collectorId: string, collectorName: string) => {
    const response = await axios.post(`${API_URL}/garbage/accept/${reportId}`, {
      collectorId,
      collectorName
    });
    return response.data;
  },

  markAsCollected: async (reportId: string, collectorId: string) => {
    const response = await axios.post(`${API_URL}/garbage/collect/${reportId}`, {
      collectorId
    });
    return response.data;
  },

  getCollectorProfile: async (collectorId: string) => {
    const response = await axios.get(`${API_URL}/collector/profile/${collectorId}`);
    return response.data;
  }
};

export const API_BASE_URL = API_URL.replace('/api', '');
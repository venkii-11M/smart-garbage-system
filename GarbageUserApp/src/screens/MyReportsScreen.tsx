import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import authService from '../services/authService';

const API_URL = 'http://10.0.2.2:5000/api';

interface Report {
  _id: string;
  photoUrl: string;
  description: string;
  location: {
    address: string;
  };
  status: string;
  collectorName?: string;
  createdAt: string;
}

export default function MyReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const response = await axios.get(`${API_URL}/user/reports/${user._id}`);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'assigned': return '#2196F3';
      case 'collected': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <Image
        source={{ uri: `${API_URL.replace('/api', '')}${item.photoUrl}` }}
        style={styles.reportImage}
      />
      <View style={styles.reportInfo}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.address}>📍 {item.location.address}</Text>
        
        {item.description && (
          <Text style={styles.description}>📝 {item.description}</Text>
        )}
        
        {item.collectorName && (
          <Text style={styles.collector}>🚛 Collector: {item.collectorName}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptySubtext}>Start by reporting garbage in your area</Text>
          </View>
        }
        contentContainerStyle={reports.length === 0 && styles.emptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  reportCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3
  },
  reportImage: {
    width: '100%',
    height: 200
  },
  reportInfo: {
    padding: 15
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  dateText: {
    fontSize: 12,
    color: '#999'
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    fontStyle: 'italic'
  },
  collector: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 5
  },
  emptyList: {
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});
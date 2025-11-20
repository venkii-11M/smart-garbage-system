import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Platform,
  ActivityIndicator
} from 'react-native';
import { api, GarbageReport, API_BASE_URL } from '../services/api';
import authService from '../services/authService';

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<GarbageReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'collected'>('pending');
  const [collector, setCollector] = useState<any>(null);

  useEffect(() => {
    loadCollector();
  }, []);

  useEffect(() => {
    if (collector) {
      loadTasks();
    }
  }, [activeTab, collector]);

  const loadCollector = async () => {
    const currentCollector = await authService.getCurrentCollector();
    setCollector(currentCollector);
  };

  const loadTasks = async () => {
    try {
      let data: GarbageReport[];
      if (activeTab === 'pending') {
        data = await api.getPendingReports();
      } else {
        data = await api.getCollectorTasks(collector._id, activeTab);
      }
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const acceptTask = async (reportId: string) => {
    try {
      await api.acceptTask(reportId, collector._id, collector.name);
      Alert.alert('Success', 'Task accepted!');
      setActiveTab('assigned');
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept task');
    }
  };

  const markAsCollected = async (reportId: string) => {
    Alert.alert(
      'Confirm Collection',
      'Have you collected this garbage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Collected',
          onPress: async () => {
            try {
              await api.markAsCollected(reportId, collector._id);
              Alert.alert('Success', 'Marked as collected!');
              loadTasks();
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          }
        }
      ]
    );
  };

  const openMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps:${lat},${lng}`,
      android: `geo:${lat},${lng}`
    });
    Linking.openURL(url!);
  };

  const callUser = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'assigned': return '#2196F3';
      case 'collected': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderTask = ({ item }: { item: GarbageReport }) => (
    <View style={styles.taskCard}>
      <Image
        source={{ uri: `${API_BASE_URL}${item.photoUrl}` }}
        style={styles.taskImage}
      />

      <View style={styles.taskInfo}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.userName}>👤 {item.userName}</Text>
        <Text style={styles.phone}>📞 {item.userPhone}</Text>
        <Text style={styles.address}>📍 {item.location.address}</Text>
        {item.description && (
          <Text style={styles.description}>📝 {item.description}</Text>
        )}
        <Text style={styles.time}>
          ⏰ {new Date(item.createdAt).toLocaleString()}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => openMaps(item.location.coordinates[1], item.location.coordinates[0])}
          >
            <Text style={styles.mapButtonText}>🗺️ Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => callUser(item.userPhone)}
          >
            <Text style={styles.callButtonText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'pending' && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptTask(item._id)}
          >
            <Text style={styles.acceptButtonText}>✓ Accept Task</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'assigned' && (
          <TouchableOpacity
            style={styles.collectButton}
            onPress={() => markAsCollected(item._id)}
          >
            <Text style={styles.collectButtonText}>✓ Mark as Collected</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            My Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collected' && styles.activeTab]}
          onPress={() => setActiveTab('collected')}
        >
          <Text style={[styles.tabText, activeTab === 'collected' && styles.activeTabText]}>
            Collected
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No tasks available</Text>
          </View>
        }
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#FF6B35'
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: 'bold'
  },
  taskCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3
  },
  taskImage: {
    width: '100%',
    height: 200
  },
  taskInfo: {
    padding: 15
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
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
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  acceptButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  collectButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  collectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});
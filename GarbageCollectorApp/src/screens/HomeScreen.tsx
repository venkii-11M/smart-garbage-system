import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import authService from '../services/authService';
import { api } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const [collector, setCollector] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentCollector = await authService.getCurrentCollector();
      if (currentCollector) {
        setCollector(currentCollector);
        const profileData = await api.getCollectorProfile(currentCollector._id);
        setStatistics(profileData.statistics);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.collectorName}>{collector?.name}</Text>
        <Text style={styles.vehicleInfo}>🚛 {collector?.vehicleNumber}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.blueCard]}>
          <Text style={styles.statNumber}>{collector?.totalCollected || 0}</Text>
          <Text style={styles.statLabel}>Total Collected</Text>
        </View>
        <View style={[styles.statCard, styles.orangeCard]}>
          <Text style={styles.statNumber}>{statistics?.pendingTasks || 0}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </View>
        <View style={[styles.statCard, styles.greenCard]}>
          <Text style={styles.statNumber}>{statistics?.completedTasks || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Tasks')}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📋</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Tasks</Text>
            <Text style={styles.actionDescription}>See all pending garbage reports</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Map')}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>🗺️</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Map View</Text>
            <Text style={styles.actionDescription}>See all reports on map</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Area Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 Your Service Area</Text>
        <Text style={styles.infoText}>{collector?.area || 'Not assigned'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  collectorName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  vehicleInfo: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 30,
    color: '#ccc',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
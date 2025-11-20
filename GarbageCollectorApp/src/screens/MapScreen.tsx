import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { api, GarbageReport, API_BASE_URL } from '../services/api';
import authService from '../services/authService';

export default function MapScreen() {
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GarbageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [collector, setCollector] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentCollector = await authService.getCurrentCollector();
      setCollector(currentCollector);
      const data = await api.getPendingReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (report: GarbageReport) => {
    setSelectedReport(report);
  };

  const handleAcceptTask = async () => {
    if (!selectedReport || !collector) return;

    try {
      await api.acceptTask(selectedReport._id, collector._id, collector.name);
      Alert.alert('Success', 'Task accepted!');
      setSelectedReport(null);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept task');
    }
  };

  const openInMaps = () => {
    if (!selectedReport) return;
    
    const lat = selectedReport.location.coordinates[1];
    const lng = selectedReport.location.coordinates[0];
    const url = Platform.select({
      ios: `maps:${lat},${lng}`,
      android: `geo:${lat},${lng}`
    });
    Linking.openURL(url!);
  };

  const callUser = () => {
    if (!selectedReport) return;
    Linking.openURL(`tel:${selectedReport.userPhone}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const initialRegion = reports.length > 0 
    ? {
        latitude: reports[0].location.coordinates[1],
        longitude: reports[0].location.coordinates[0],
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 20.9374,
        longitude: 77.7798,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {reports.map((report) => (
          <Marker
            key={report._id}
            coordinate={{
              latitude: report.location.coordinates[1],
              longitude: report.location.coordinates[0],
            }}
            title={report.userName}
            description={report.location.address}
            pinColor="#FF6B35"
            onPress={() => handleMarkerPress(report)}
          />
        ))}
      </MapView>

      {selectedReport && (
        <View style={styles.detailsCard}>
          <ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedReport(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Image
              source={{ uri: `${API_BASE_URL}${selectedReport.photoUrl}` }}
              style={styles.cardImage}
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>📍 Garbage Report</Text>
              <Text style={styles.cardText}>👤 {selectedReport.userName}</Text>
              <Text style={styles.cardText}>📞 {selectedReport.userPhone}</Text>
              <Text style={styles.cardText}>📍 {selectedReport.location.address}</Text>
              {selectedReport.description && (
                <Text style={styles.cardDescription}>📝 {selectedReport.description}</Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
                  <Text style={styles.actionButtonText}>🗺️ Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={callUser}>
                  <Text style={styles.actionButtonText}>📞 Call</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTask}>
                <Text style={styles.acceptButtonText}>✓ Accept Task</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>📍 {reports.length} Pending Reports</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsBar: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});
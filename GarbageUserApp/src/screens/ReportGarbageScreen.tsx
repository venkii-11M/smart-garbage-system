import * as React from 'react';
import { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { submitGarbageReport } from '../services/api';
import authService from '../services/authService';

export default function ReportGarbageScreen({ navigation }: any) {
  const [photo, setPhoto] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState('Getting location...');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    requestPermissions();
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        if (granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted') {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setAddress(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Unable to get location');
        setAddress('Location unavailable');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

const takePhoto = async () => {
  const options = {
    mediaType: 'photo' as const,
    quality: 1 as any,
    saveToPhotos: false
  };


  launchCamera(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled camera');
    } else if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Camera error');
    } else if (response.assets && response.assets[0]) {
      setPhoto(response.assets[0]);
    }
  });
};

  const submitReport = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please take a photo of the garbage');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable GPS');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        photo: photo,
        userId: user._id,
        userName: user.name,
        userPhone: user.phone,
        userAddress: user.address || '',
        description: description,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address
      };

      const response = await submitGarbageReport(reportData);

      if (response.success) {
        Alert.alert(
          'Success!',
          'Garbage report submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPhoto(null);
                setDescription('');
                getCurrentLocation();
                navigation.navigate('MyReports');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report. Please try again.';
      Alert.alert(
        'Submission Failed',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => console.log('Error acknowledged')
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>No photo taken</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>
              {photo ? '📷 Retake Photo' : '📷 Take Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.label}>📍 Location:</Text>
          <Text style={styles.locationText}>{address}</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄 Refresh Location</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={styles.label}>👤 Your Information:</Text>
          <Text style={styles.infoText}>Name: {user?.name}</Text>
          <Text style={styles.infoText}>Phone: {user?.phone}</Text>
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>📝 Description (Optional):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add details about the garbage..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={submitReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>✓ Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  photoSection: {
    marginBottom: 20
  },
  photoPreview: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10
  },
  photoPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 10
  },
  placeholderText: {
    color: '#999',
    fontSize: 16
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  locationSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  refreshButton: {
    marginTop: 5
  },
  refreshText: {
    color: '#2196F3',
    fontSize: 14
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  inputSection: {
    marginBottom: 20
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
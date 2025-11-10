import React, { useState, useEffect } from 'react';
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
  PermissionsAndroid
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { submitGarbageReport } from '../services/api';

export default function ReportGarbageScreen() {
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Getting location...');
  const [loading, setLoading] = useState(false);

  const user = {
    _id: '6910c315e14a39f4d4d5bb79', 
    name: 'Test User',
    phone: '9876543210',
    address: '123 Test Street, Amravati'
  };

  useEffect(() => {
    requestPermissions();
  }, []);

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
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: false
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
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

    setLoading(true);

    try {
      const reportData = {
        photo: photo,
        userId: user._id,
        userName: user.name,
        userPhone: user.phone,
        userAddress: user.address,
        description: description,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address
      };

      const response = await submitGarbageReport(reportData);

      if (response.success) {
        Alert.alert(
          'Success!',
          'Garbage report submitted successfully. Collectors will be notified.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPhoto(null);
                setDescription('');
                getCurrentLocation();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🗑️ Report Garbage</Text>
        <Text style={styles.subtitle}>Help keep your city clean</Text>

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
          <Text style={styles.infoText}>Name: {user.name}</Text>
          <Text style={styles.infoText}>Phone: {user.phone}</Text>
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
          <Text style={styles.submitButtonText}>
            {loading ? '⏳ Submitting...' : '✓ Submit Report'}
          </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  photoSection: {
    marginBottom: 20
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10
  },
  photoPlaceholder: {
    width: '100%',
    height: 300,
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
    borderColor: '#e0e0e0'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
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
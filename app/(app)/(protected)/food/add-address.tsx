import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

const { width, height } = Dimensions.get('window');

// Enhanced dark theme for Google Maps
const mapDarkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1419' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0f1419' }] },
];

const AddAddressScreen = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const colorScheme = useColorScheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const [initialRegion] = useState<Region>({
    latitude: 38.3121,
    longitude: 27.1453,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });
  
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 38.3121,
    longitude: 27.1453,
  });
  
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for marker
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setMarkerCoordinate({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
    
    // Subtle haptic feedback when moving the map
    Haptics.selectionAsync();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveAddress = async () => {
    if (!locationName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Missing Information', 'Please provide a name for this address (e.g., "Home", "Office").');
      return;
    }
    if (!user) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Error', 'You must be logged in to save an address.');
      return;
    }

    handleButtonPress();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('addresses').insert({
        location: locationName,
        description: description,
        coordinates: `${markerCoordinate.latitude.toFixed(6)}, ${markerCoordinate.longitude.toFixed(6)}`,
        is_default: false,
        user_id: user.id,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'New address has been saved successfully!', [
        { text: 'OK', onPress: handleBackPress },
      ]);
    } catch (err: any) {
      console.error('Failed to save address:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.message || 'An unexpected error occurred while saving the address.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider="google"
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={() => setIsMapReady(true)}
        showsUserLocation
        showsMyLocationButton
        customMapStyle={isDark ? mapDarkStyle : []}
        mapPadding={{ top: 0, right: 0, bottom: 300, left: 0 }}
      />

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            onPress={handleBackPress} 
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Set Location</Text>
            <Text style={styles.headerSubtitle}>Drag map to adjust pin</Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.markerContainer, 
            { 
              opacity: isMapReady ? fadeAnim : 0,
              transform: [{ scale: pulseAnim }] 
            }
          ]} 
          pointerEvents="none"
        >
          <View style={styles.markerShadow} />
          <MaterialIcons name="location-pin" size={48} color="#9a0f21" />
        </Animated.View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.handleBar} />
            <Text style={styles.formLabel}>Address Details</Text>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="home" size={20} color={isDark ? '#888' : '#666'} />
              <TextInput
                style={styles.input}
                placeholder="Address Name (e.g., Home, Office)"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={locationName}
                onChangeText={setLocationName}
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="description" size={20} color={isDark ? '#888' : '#666'} />
              <TextInput
                style={styles.input}
                placeholder="Description (e.g., Near the main gate)"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={description}
                onChangeText={setDescription}
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
            
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
                onPress={handleSaveAddress}
                disabled={isSubmitting}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Address</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000' : '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#fff' : '#000',
    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
    overflow: 'hidden',
  },
  headerSubtitle: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#666',
    backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },
  markerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  markerShadow: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ scaleX: 1.5 }],
  },
  keyboardAvoidingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  formContainer: {
    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  handleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: isDark ? '#48484a' : '#d1d1d6',
    alignSelf: 'center',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#38383a' : '#e5e5ea',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingLeft: 12,
    color: isDark ? '#fff' : '#000',
  },
  saveButton: {
    backgroundColor: '#9a0f21',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#9a0f21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#666',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AddAddressScreen; 
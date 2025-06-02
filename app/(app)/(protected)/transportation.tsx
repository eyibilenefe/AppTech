import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as LocationExpo from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import BusMarker from '@/components/BusMarker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const { width, height } = Dimensions.get('window');

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: 'bus_stop' | 'station' | 'landmark';
}

interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface Bus {
  id: string;
  latitude: number;
  longitude: number;
  route: string;
  isMoving: boolean;
  passengers: number;
}

const Transportation = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  
  // State for map editing
  const [editMode, setEditMode] = useState<'none' | 'add_location' | 'add_route'>('none');
  const [showBuses, setShowBuses] = useState(true);
  const [userCurrentCoords, setUserCurrentCoords] = useState<RoutePoint | null>(null);
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      latitude: 38.3184,
      longitude: 26.6435,
      title: 'Rektörlük',
      type: 'bus_stop'
    },
    {
      id: '2',
      latitude: 38.3162,
      longitude: 26.6382,
      title: 'Yabancı Diller',
      type: 'bus_stop'
    },
    {
      id: '3',
      latitude: 38.320425,
      longitude: 26.639176,
      title: 'Kütüphane',
      type: 'bus_stop'
    },
    {
      id: '4',
      latitude: 38.3234,
      longitude: 26.6399,
      title: 'Şenlik Alanı',
      type: 'bus_stop'
    },
    {
      id: '5',
      latitude: 38.32463433756970,
      longitude: 26.635313111491,
      title: 'Yurtlar',
      type: 'bus_stop'
    },
    {
      id: '6',
      latitude: 38.3245,
      longitude: 26.6353,
      title: 'Yurtlar',
      type: 'bus_stop'
    },
    {
      id: '7',
      latitude: 38.324254,
      longitude: 26.630990,
      title: 'İYTE Son Durak',
      type: 'bus_stop'
    }
  ]);
  
  const [routes, setRoutes] = useState<RoutePoint[][]>([
    [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78925, longitude: -122.4314 },
      { latitude: 37.79025, longitude: -122.4304 },
      { latitude: 37.79125, longitude: -122.4294 },
    ]
  ]);
  
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: 'bus1',
      latitude: 37.78875,
      longitude: -122.4319,
      route: 'Route 101',
      isMoving: true,
      passengers: 12
    },
    {
      id: 'bus2',
      latitude: 37.79075,
      longitude: -122.4299,
      route: 'Route 101',
      isMoving: false,
      passengers: 8
    }
  ]);
  
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);

  // Initial map region
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Automatically center on user location when the component mounts
  useEffect(() => {
    centerOnUserLocation();
  }, []);

  const requestUserLocation = async (): Promise<RoutePoint | null> => {
    const { status } = await LocationExpo.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is needed to show your current location.');
      return null;
    }
    try {
      const location = await LocationExpo.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserCurrentCoords(coords);
      return coords;
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch current location.');
      console.error("Error fetching location: ", error);
      return null;
    }
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    
    if (editMode === 'add_location') {
      const newLocation: Location = {
        id: Date.now().toString(),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        title: `Location ${locations.length + 1}`,
        type: 'bus_stop'
      };
      setLocations([...locations, newLocation]);
      setEditMode('none');
    } else if (editMode === 'add_route') {
      setCurrentRoute([...currentRoute, coordinate]);
    }
  };

  const finishRoute = () => {
    if (currentRoute.length > 1) {
      setRoutes([...routes, currentRoute]);
      setCurrentRoute([]);
      setEditMode('none');
    } else {
      Alert.alert('Route Error', 'Please add at least 2 points to create a route');
    }
  };

  const clearCurrentRoute = () => {
    setCurrentRoute([]);
    setEditMode('none');
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'station':
        return 'train';
      case 'bus_stop':
        return 'bus';
      default:
        return 'location';
    }
  };

  const centerOnUserLocation = async () => {
    let locationToCenter = userCurrentCoords;
    if (!locationToCenter) {
      locationToCenter = await requestUserLocation();
    }

    if (locationToCenter && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...locationToCenter,
          latitudeDelta: 0.005, // Zoom in a bit more for user location
          longitudeDelta: 0.005,
        },
        1000
      );
    } else if (!locationToCenter) {
      // If user cancelled or an error occurred, and we don't have a location
      // Optionally, inform the user or just don't move the map.
      // For now, let's fall back to the initial region if no location is set.
      mapRef.current?.animateToRegion(initialRegion, 1000);
      Alert.alert("Location Unavailable", "Could not center on user location.");
    }
    // If locationToCenter is null but userCurrentCoords was already set,
    // the map would have centered on the previous userCurrentCoords.
    // If requestUserLocation returned null (e.g. user pressed cancel)
    // and userCurrentCoords was null, then the map won't move to user,
    // and we can show an alert or just do nothing further.
  };

  const toggleBusVisibility = () => {
    setShowBuses(!showBuses);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        mapType="standard"
        userInterfaceStyle="light"
      >
        {/* User's Current Location Marker */}
        {userCurrentCoords && (
          <Marker
            coordinate={userCurrentCoords}
            title="My Location"
            pinColor="blue" // Or use a custom marker view
          >
            {/* Example of a simple custom marker view for user location */}
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Location Markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.type === 'station' ? 'Train Station' : 'Bus Stop'}
          >
            <View style={[styles.markerContainer, 
              location.type === 'station' ? styles.stationMarker : styles.busStopMarker
            ]}>
              <Ionicons 
                name={getMarkerIcon(location.type) as any} 
                size={20} 
                color="white" 
              />
            </View>
          </Marker>
        ))}

        {/* Bus Markers */}
        {showBuses && buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={{
              latitude: bus.latitude,
              longitude: bus.longitude,
            }}
            title={bus.route}
            description={`Passengers: ${bus.passengers}`}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <BusMarker isMoving={bus.isMoving} />
          </Marker>
        ))}

        {/* Route Polylines */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route}
            strokeColor="#9a0f21"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        ))}

        {/* Current Route Being Drawn */}
        {currentRoute.length > 1 && (
          <Polyline
            coordinates={currentRoute}
            strokeColor="#FF6B6B"
            strokeWidth={3}
            lineDashPattern={[2, 2]}
          />
        )}

        {/* Current Route Points */}
        {currentRoute.map((point, index) => (
          <Marker
            key={`current-${index}`}
            coordinate={point}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.routePoint}>
              <Text style={styles.routePointText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <Button
          variant="outline"
          size="icon"
          style={[styles.controlButton, { marginBottom: 10 }]}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={20} color="#9a0f21" />
        </Button>
        
        <Button
          variant={showBuses ? "default" : "outline"}
          size="icon"
          style={styles.controlButton}
          onPress={toggleBusVisibility}
        >
          <Ionicons name="bus" size={20} color={showBuses ? "gray" : "#9a0f21"} />
        </Button>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {/* Header with Route Buttons and Settings */}
          <View style={styles.timetableHeader}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.routeButtons}
              contentContainerStyle={styles.routeButtons}
            >
              <Pressable style={[styles.routeButton, styles.activeRoute]}>
                <Text style={styles.routeButtonText}>883</Text>
              </Pressable>
              <Pressable style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>882</Text>
              </Pressable>
              <Pressable style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>982</Text>
              </Pressable>
              <Pressable style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>981</Text>
              </Pressable>
              <Pressable style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>760</Text>
              </Pressable>
              <Pressable style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>Ring</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Route Display */}
          <View style={styles.routeDisplay}>
            <Text style={styles.routeText}>İYTE → F. Altıyol</Text>
            <Pressable style={styles.directionButton}>
              <Ionicons name="swap-horizontal" size={20} color="#9a0f21" />
            </Pressable>
          </View>

          {/* Date Selector */}
          <View style={styles.dateSelector}>
            <Pressable style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={20} color="#666" />
            </Pressable>
            <Text style={styles.dateText}>Today</Text>
            <Pressable style={styles.dateArrow}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Timetable Content */}
          <ScrollView style={styles.timetableContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.timetableRow}>
              {/* Left Column - Timetable */}
              <View style={styles.timetableColumn}>
                <Text style={styles.columnHeader}>Departure Times</Text>
                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, index) => (
                  <View key={index} style={styles.timeItem}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                ))}
              </View>

              {/* Right Column - Bus Stops */}
              <View style={styles.stopsColumn}>
                <Text style={styles.columnHeader}>Bus Stops</Text>
                {[
                  'Mimarlık',
                  'Fen',
                  'KYK',
                  'Şehit A',
                  'Kütüphane',
                  'Hazırlık',
                  'Mühendislik',
                  'Rektörlük'
                ].map((stop, index) => (
                  <View key={index} style={styles.stopItem}>
                    <Ionicons name="location" size={16} color="#4ECDC4" />
                    <Text style={styles.stopText}>{stop}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomNavigation}>
            <Pressable style={styles.navItem}>
              <Ionicons name="home" size={24} color="#9a0f21" />
            </Pressable>
            <Pressable style={styles.navItem}>
              <Ionicons name="map" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.navItem}>
              <Ionicons name="bus" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.navItem}>
              <Ionicons name="time" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.navItem}>
              <Ionicons name="person" size={24} color="#666" />
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  mapControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stationMarker: {
    backgroundColor: '#FF6B6B',
  },
  busStopMarker: {
    backgroundColor: '#4ECDC4',
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)', // Translucent blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9a0f21', // Solid blue
    borderWidth: 2,
    borderColor: 'white',
  },
  routePoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9a0f21',
  },
  routePointText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timetableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  routeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#9a0f21',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  activeRoute: {
    backgroundColor: '#9a0f21',
  },
  routeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  routeButtonTextInactive: {
    color: '#9a0f21',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsButton: {
    padding: 8,
  },
  routeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  directionButton: {
    padding: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timetableContainer: {
    flex: 1,
    marginBottom: 20,
  },
  timetableRow: {
    flexDirection: 'row',
    gap: 20,
  },
  timetableColumn: {
    flex: 1,
  },
  stopsColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    gap: 8,
  },
  stopText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  navItem: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Transportation;
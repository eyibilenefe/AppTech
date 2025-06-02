import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as LocationExpo from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
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
      latitude: 37.78825,
      longitude: -122.4324,
      title: 'Main Bus Station',
      type: 'station'
    },
    {
      id: '2',
      latitude: 37.78925,
      longitude: -122.4314,
      title: 'University Stop',
      type: 'bus_stop'
    },
    {
      id: '3',
      latitude: 37.79125,
      longitude: -122.4294,
      title: 'Shopping Center',
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
            strokeColor="#007AFF"
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
          <Ionicons name="locate" size={20} color="#007AFF" />
        </Button>
        
        <Button
          variant={showBuses ? "default" : "outline"}
          size="icon"
          style={styles.controlButton}
          onPress={toggleBusVisibility}
        >
          <Ionicons name="bus" size={20} color={showBuses ? "white" : "#007AFF"} />
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
          <View style={styles.bottomSheetHeader}>
            <Text className="text-2xl font-bold text-foreground">Transportation Hub</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Manage routes, stops, and transportation options
            </Text>
          </View>

          {/* Edit Mode Status */}
          {editMode !== 'none' && (
            <View style={styles.editModeBar}>
              <Text className="text-sm font-medium text-white">
                {editMode === 'add_location' 
                  ? 'Tap on map to add location' 
                  : `Drawing route (${currentRoute.length} points)`
                }
              </Text>
              {editMode === 'add_route' && currentRoute.length > 1 && (
                <View style={styles.routeActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={finishRoute}
                    style={styles.routeButton}
                  >
                    <Text className="text-xs">Finish Route</Text>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onPress={clearCurrentRoute}
                    style={styles.routeButton}
                  >
                    <Text className="text-xs">Cancel</Text>
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionGrid}>
            <Button
              variant={editMode === 'add_location' ? 'default' : 'outline'}
              style={styles.actionButton}
              onPress={() => setEditMode(editMode === 'add_location' ? 'none' : 'add_location')}
            >
              <Ionicons name="add-circle" size={20} color={editMode === 'add_location' ? 'white' : '#007AFF'} />
              <Text className={`text-sm font-medium ml-2 ${editMode === 'add_location' ? 'text-white' : 'text-foreground'}`}>
                Add Stop
              </Text>
            </Button>

            <Button
              variant={editMode === 'add_route' ? 'default' : 'outline'}
              style={styles.actionButton}
              onPress={() => setEditMode(editMode === 'add_route' ? 'none' : 'add_route')}
            >
              <Ionicons name="trail-sign" size={20} color={editMode === 'add_route' ? 'white' : '#007AFF'} />
              <Text className={`text-sm font-medium ml-2 ${editMode === 'add_route' ? 'text-white' : 'text-foreground'}`}>
                Add Route
              </Text>
            </Button>

            <Button
              variant={showBuses ? 'default' : 'outline'}
              style={styles.actionButton}
              onPress={toggleBusVisibility}
            >
              <Ionicons name="bus" size={20} color={showBuses ? 'white' : '#007AFF'} />
              <Text className={`text-sm font-medium ml-2 ${showBuses ? 'text-white' : 'text-foreground'}`}>
                Live Buses
              </Text>
            </Button>

            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => {/* Handle schedule */}}
            >
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text className="text-sm font-medium ml-2 text-foreground">
                Schedules
              </Text>
            </Button>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text className="text-2xl font-bold text-foreground">{locations.length}</Text>
              <Text className="text-sm text-muted-foreground">Locations</Text>
            </View>
            <View style={styles.statItem}>
              <Text className="text-2xl font-bold text-foreground">{routes.length}</Text>
              <Text className="text-sm text-muted-foreground">Routes</Text>
            </View>
            <View style={styles.statItem}>
              <Text className="text-2xl font-bold text-foreground">{buses.length}</Text>
              <Text className="text-sm text-muted-foreground">Active Buses</Text>
            </View>
          </View>

          {/* Recent Locations */}
          <View style={styles.recentSection}>
            <Text className="text-lg font-semibold text-foreground mb-3">Recent Locations</Text>
            {locations.slice(-3).map((location) => (
              <View key={location.id} style={styles.locationItem}>
                <View style={[styles.locationIcon, 
                  location.type === 'station' ? styles.stationMarker : styles.busStopMarker
                ]}>
                  <Ionicons name={getMarkerIcon(location.type) as any} size={16} color="white" />
                </View>
                <View style={styles.locationInfo}>
                  <Text className="text-sm font-medium text-foreground">{location.title}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {location.type === 'station' ? 'Train Station' : 'Bus Stop'}
                  </Text>
                </View>
                <Button variant="ghost" size="icon">
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </Button>
              </View>
            ))}
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
    backgroundColor: '#007AFF', // Solid blue
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
    borderColor: 'white',
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
  bottomSheetHeader: {
    marginBottom: 20,
  },
  editModeBar: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  routeButton: {
    minWidth: 80,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  recentSection: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
});

export default Transportation;
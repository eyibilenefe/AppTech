import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as LocationExpo from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { AnimatedRegion, Marker, Polyline } from 'react-native-maps';

import BusMarker from '@/components/BusMarker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import busStopsData from '@/data/bus-stops-real.json';

// --- API and Configuration Constants ---
const API_BASE_URL = 'https://openapi.izmir.bel.tr/api';
const BUS_LINES = ['883', '882', '982', '981', '760']; // Example bus lines
const UPDATE_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Mapping of line numbers to their endpoints (and display name for 883 Express)
const BUS_LINE_DETAILS: Record<string, { ends: [string, string]; label?: string }> = {
  '883': { ends: ['İYTE', 'Fahrettin Altay'], label: 'Express' },
  '882': { ends: ['İYTE', 'Urla'] },
  '982': { ends: ['İYTE', 'Fahrettin Altay'] },
  '981': { ends: ['Balıklıova', 'Fahrettin Altay'] },
  '760': { ends: ['Urla', 'Çeşme'] },
};

// --- Utility Functions ---
const logWithTimestamp = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const { width, height } = Dimensions.get('window');

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: 'bus_stop' | 'station' | 'landmark';
}

// New interface for Bus Stops from API
interface BusStop {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: 'bus_stop';
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
  direction: number; // 0 -> reverse, 1 -> normal (IYTE → F.A.), semantics per line
}

const Transportation = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  
  // State for map editing
  const [editMode, setEditMode] = useState<'none' | 'add_location' | 'add_route'>('none');
  const [showBuses, setShowBuses] = useState(true);
  const [filterByActiveLine, setFilterByActiveLine] = useState(false);
  const [userCurrentCoords, setUserCurrentCoords] = useState<RoutePoint | null>(null);
  
  // State for API data
  const [busLocations, setBusLocations] = useState<Bus[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [activeBusLine, setActiveBusLine] = useState<string>(BUS_LINES[0]);

  // State for map interaction
  const lastRegion = useRef<any>(null);

  // Track map zoom level to control marker visibility
  const [currentZoomLevel, setCurrentZoomLevel] = useState(0.01);

  // Convert bus stops data from JSON to Location format (limit to 50 for performance)
  const [locations, setLocations] = useState<Location[]>(() => {
    return busStopsData.records.slice(0, 50).map((record) => ({
      id: record[1].toString(), // DURAK_ID
      latitude: typeof record[3] === 'number' ? record[3] : parseFloat(record[3].toString()), // ENLEM
      longitude: typeof record[4] === 'number' ? record[4] : parseFloat(record[4].toString()), // BOYLAM
      title: record[2].toString(), // DURAK_ADI
      type: 'bus_stop' as const
    }));
  });
  
  const [routes, setRoutes] = useState<RoutePoint[][]>([
    [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78925, longitude: -122.4314 },
      { latitude: 37.79025, longitude: -122.4304 },
      { latitude: 37.79125, longitude: -122.4294 },
    ]
  ]);
  
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);

  // Track UI-level direction toggle for route text
  const [reverseDirection, setReverseDirection] = useState(false);

  // Initial map region
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Decide which buses should be rendered on the map (respects visibility toggle & optional filtering)
  const busesToRender = useMemo(() => {
    if (!showBuses) return [];
    if (filterByActiveLine) {
      return busLocations.filter(b => b.route === activeBusLine);
    }
    return busLocations;
  }, [showBuses, filterByActiveLine, activeBusLine, busLocations]);

  // Animated regions cache for smooth movement of bus markers
  const busAnimatedRegions = useRef<{ [id: string]: AnimatedRegion }>({});

  // --- Lifecycle Hooks for Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      logWithTimestamp('Starting initial data fetch for all bus lines.');
      const allBuses: Bus[] = [];
      for (const line of BUS_LINES) {
        const buses = await fetchBusLocations(line);
        allBuses.push(...buses);
        await delay(2000); // 2-second delay to avoid rate-limiting
      }
      console.log(allBuses);
      setBusLocations(allBuses);
      getBusStops(activeBusLine);
    };

    fetchInitialData();
    centerOnUserLocation();
  }, []);

  useEffect(() => {
    let currentLineIndex = 0;
    const updateBusLocations = async () => {
      if (BUS_LINES.length === 0) return;
      
      const busLineToUpdate = BUS_LINES[currentLineIndex];
      logWithTimestamp(`Updating locations for line: ${busLineToUpdate}`);
      const updatedBuses = await fetchBusLocations(busLineToUpdate);
      
      setBusLocations(prevBuses => {
        const otherBuses = prevBuses.filter(bus => bus.route !== busLineToUpdate);
        return [...otherBuses, ...updatedBuses];
      });

      currentLineIndex = (currentLineIndex + 1) % BUS_LINES.length;
    };
    
    const intervalId = setInterval(updateBusLocations, UPDATE_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, []);

  // Whenever fresh bus location data arrives, smoothly move markers
  useEffect(() => {
    busesToRender.forEach((bus) => {
      const { latitude, longitude } = bus;

      if (busAnimatedRegions.current[bus.id]) {
        // Animate – typing for react-native-maps AnimatedRegion is inaccurate, cast to any
        (busAnimatedRegions.current[bus.id] as any)
          .timing({ latitude, longitude, duration: 1000, useNativeDriver: false })
          .start();
      } else {
        // Initialize AnimatedRegion for new bus
        busAnimatedRegions.current[bus.id] = new AnimatedRegion({
          latitude,
          longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        });
      }
    });
  }, [busesToRender]);

  // --- Data Fetching and Memoization ---
  const filteredBusStops = useMemo(() => {
    // Only show bus stops when a specific line is selected
    if (!filterByActiveLine) return [];
    
    if (!lastRegion.current || lastRegion.current.latitudeDelta > 0.02) {
      return [];
    }
    
    return busStops.filter(stop => {
      const { latitude, longitude } = stop;
      const { latitude: mapLat, longitude: mapLng, latitudeDelta, longitudeDelta } = lastRegion.current;
      
      return (
        latitude > mapLat - latitudeDelta / 2 &&
        latitude < mapLat + latitudeDelta / 2 &&
        longitude > mapLng - longitudeDelta / 2 &&
        longitude < mapLng + longitudeDelta / 2
      );
    });
  }, [busStops, lastRegion.current, filterByActiveLine]);

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 4000; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Filter locations based on selected bus line and available bus stops data
  const filteredLocations = useMemo(() => {
    if (!filterByActiveLine) {
      // When "All" is selected, show only locations near user's current position
      if (!userCurrentCoords) {
        return []; // No locations if user location is unknown
      }
      
      const NEARBY_RADIUS_KM = 2; // Show stops within 2km radius
      return locations.filter(location => {
        const distance = calculateDistance(
          userCurrentCoords.latitude,
          userCurrentCoords.longitude,
          location.latitude,
          location.longitude
        );
        return distance <= NEARBY_RADIUS_KM;
      });
    }
    
    // Find stops from JSON data that serve the active bus line
    const relevantStopIds = new Set(
      busStopsData.records
        .filter(record => {
          const routes = record[5].toString(); // DURAKTAN_GECEN_HATLAR
          return routes.includes(activeBusLine);
        })
        .map(record => record[1].toString()) // DURAK_ID
    );
    
    return locations.filter(location => relevantStopIds.has(location.id));
  }, [locations, filterByActiveLine, activeBusLine, userCurrentCoords]);

  // --- Data Fetching Functions ---
  const fetchBusLocations = async (busLine: string): Promise<Bus[]> => {
    logWithTimestamp(`Fetching locations for bus line: ${busLine}`);
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/iztek/hatotobuskonumlari/${busLine}`);
        if (response.status === 429) {
          logWithTimestamp(`Rate limit hit for ${busLine}. Retrying after ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY * (i + 1));
          continue;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.HatOtobusKonumlari) {
          logWithTimestamp(`No bus location data returned for line ${busLine}.`);
          return [];
        }
        const buses: Bus[] = data.HatOtobusKonumlari.map((bus: any) => ({
          id: bus.OtobusId,
          latitude: parseFloat(bus.KoorX.split(',').join('.')),
          longitude: parseFloat(bus.KoorY.split(',').join('.')),
          route: busLine,
          direction: parseInt(bus.Yon ?? '0', 10),
        }));

        // The API can occasionally return duplicate entries for the same bus.
        // We'll deduplicate by bus ID, keeping only the last entry found.
        const busMap = new Map<string, Bus>();
        for (const bus of buses) {
          busMap.set(bus.id, bus);
        }
        
        return Array.from(busMap.values());
      } catch (error) {
        logWithTimestamp(`Error fetching bus locations for ${busLine} (Attempt ${i + 1}): ${error}`);
        if (i < MAX_RETRIES - 1) {
          await delay(RETRY_DELAY);
        } else {
          Alert.alert('API Error', `Failed to fetch data for bus line ${busLine} after multiple retries.`);
          return [];
        }
      }
    }
    return [];
  };

  const getBusStops = async (busLine: string) => {
    logWithTimestamp(`Fetching stops for bus line: ${busLine}`);
    try {
      const response = await fetch(`${API_BASE_URL}/iztek/hatduraklari/${busLine}`);

      // Gracefully handle cases where the API does not have stop data for the requested line
      if (response.status === 404) {
        logWithTimestamp(`No stop data available for line ${busLine} (404).`);
        setBusStops([]);
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log(data);
      const stops = (data?.Duraklar || []).map((stop: any) => ({
        id: stop.Sira,
        title: stop.DurakAdi,
        latitude: parseFloat(stop.Enlem),
        longitude: parseFloat(stop.Boylam),
        type: 'bus_stop'
      }));
      setBusStops(stops);
    } catch (error) {
      logWithTimestamp(`Error fetching bus stops for ${busLine}: ${error}`);
      // Silently fail – keeping UX clean when stop data is unavailable or the API errors
    }
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

  // --- Map Interaction Handlers ---
  const handleSelectBus = (bus: Bus) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: bus.latitude,
        longitude: bus.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };
  
  const handleBusStopSelect = React.useCallback((stop: BusStop) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, []);

  const handleBusLineChange = (busLine: string) => {
    setActiveBusLine(busLine);
    setFilterByActiveLine(true); // Start filtering bus markers after a manual selection
    getBusStops(busLine);
    setReverseDirection(false); // reset arrow orientation when user picks a different line

    const firstBusOfLine = busLocations.find(bus => bus.route === busLine);
    if (firstBusOfLine) {
      handleSelectBus(firstBusOfLine);
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

  // --- Helpers ---
  const getRouteText = () => {
    if (!filterByActiveLine) return 'All Buses';
    const details = BUS_LINE_DETAILS[activeBusLine];
    if (!details) return '';
    const [from, to] = reverseDirection ? [...details.ends].reverse() : details.ends;
    return `${from} → ${to}` + (details.label ? ` (${details.label})` : '');
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
        onRegionChangeComplete={(region) => {
          lastRegion.current = region;
          setCurrentZoomLevel(region.latitudeDelta);
        }}
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

        {/* Location Markers - Only show when zoomed in enough */}
        {currentZoomLevel < 0.1 && filteredLocations.map((location, index) => (
          <Marker
            key={`loc-${location.id}-${index}`}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.type === 'station' ? 'Train Station' : 'Bus Stop'}
          >
            <View style={[styles.markerContainerSmall, 
              location.type === 'station' ? styles.stationMarker : styles.busStopMarker
            ]}>
              <Ionicons 
                name={getMarkerIcon(location.type) as any} 
                size={16} 
                color="white" 
              />
            </View>
          </Marker>
        ))}

        {/* Bus Stop Markers */}
        {currentZoomLevel < 0.02 && filteredBusStops.map((stop, index) => (
          <Marker
            key={`stop-${stop.id}-${index}`}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.title}
            onPress={() => handleBusStopSelect(stop)}
          >
            <View style={styles.busStopMarkerSmall}>
              <Ionicons 
                name={'bus'} 
                size={16} 
                color="white" 
              />
            </View>
          </Marker>
        ))}

        {/* Bus Markers */}
        {busesToRender.map((bus) => (
          <Marker.Animated
            key={`${bus.id}-${bus.route}`}
            coordinate={(busAnimatedRegions.current[bus.id] as any) ?? {
              latitude: bus.latitude,
              longitude: bus.longitude,
              latitudeDelta: 0,
              longitudeDelta: 0,
            }}
            title={bus.route}
            description={`Direction: ${bus.direction === 0 ? '⬅︎' : '➡︎'}`}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => handleSelectBus(bus)}
          >
            <BusMarker />
          </Marker.Animated>
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
              {/* Show ALL button */}
              <Pressable 
                key="all"
                style={[styles.routeButton, !filterByActiveLine && styles.activeRoute]}
                onPress={() => setFilterByActiveLine(false)}
              >
                <Text style={!filterByActiveLine ? styles.routeButtonText : styles.routeButtonTextInactive}>All</Text>
              </Pressable>

              {BUS_LINES.map(line => (
                <Pressable 
                  key={line}
                  style={[
                    styles.routeButton,
                    filterByActiveLine && activeBusLine === line && styles.activeRoute,
                  ]}
                  onPress={() => handleBusLineChange(line)}
                >
                  <Text style={filterByActiveLine && activeBusLine === line ? styles.routeButtonText : styles.routeButtonTextInactive}>
                    {line}
                  </Text>
                </Pressable>
              ))}
              <Pressable key="Ring" style={styles.routeButton}>
                <Text style={styles.routeButtonTextInactive}>Ring</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Route Display */}
          <View style={styles.routeDisplay}>
            <Text style={styles.routeText}>{getRouteText()}</Text>
            <Pressable
              style={styles.directionButton}
              onPress={() => setReverseDirection((prev) => !prev)}
            >
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
  markerContainerSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  busStopMarkerSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
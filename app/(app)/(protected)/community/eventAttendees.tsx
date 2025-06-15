import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface Attendee {
  id: string;
  name: string;
  email: string;
  pp: string | null; // profile picture
  dept: string;
  st_id: string;
}

const EventAttendeesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId: string;
    eventName: string;
  }>();

  const { eventId, eventName } = params;

  // State
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch event attendees
  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!eventId) {
        throw new Error('Event ID is required');
      }

      // Fetch attendees with user information
      const { data, error } = await supabase
        .from('attenders')
        .select(`
          users (
            id,
            name,
            email,
            pp,
            dept,
            st_id
          )
        `)
        .eq('event_id', eventId);

      if (error) {
        throw error;
      }

      // Process attendees data and get profile picture URLs
      const processedAttendees = await Promise.all(
        (data || []).map(async (item: any) => {
          const user = item.users;
          if (!user) return null;

          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            pp: user.pp,
            dept: user.dept,
            st_id: user.st_id,
          };
        })
      );

      // Filter out null values
      const validAttendees = processedAttendees.filter(attendee => attendee !== null) as Attendee[];
      
      setAttendees(validAttendees);
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
      setError(error.message || 'Failed to fetch attendees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    fetchAttendees();
  };

  const handleAttendeePress = (attendee: Attendee) => {
    router.push({
      pathname: '/community/attendeeProfile',
      params: {
        userId: attendee.id,
      }
    });
  };

  const renderAttendeeItem = ({ item }: { item: Attendee }) => (
    <TouchableOpacity style={styles.attendeeCard} onPress={() => handleAttendeePress(item)}>
      <View style={styles.profileImageContainer}>
        {item.pp ? (
          <Image source={{ uri: item.pp }} style={styles.profileImage} />
        ) : (
          <View style={styles.defaultAvatar}>
            <MaterialIcons name="person" size={24} color="#666" />
          </View>
        )}
      </View>
      
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{item.name}</Text>
        <Text style={styles.attendeeDepartment}>{item.dept}</Text>
        <Text style={styles.attendeeStudentId}>ID: {item.st_id}</Text>
      </View>
      
      <View style={styles.attendeeActions}>
        <MaterialIcons name="chevron-right" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Attendees Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to join this event!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.eventTitle}>{eventName}</Text>
      <Text style={styles.attendeeCount}>
        {attendees.length} {attendees.length === 1 ? 'Attendee' : 'Attendees'}
      </Text>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Attendees</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Attendees</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#f44336" />
          <Text style={styles.errorText}>Failed to load attendees</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Attendees</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={attendees}
        renderItem={renderAttendeeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#9a0f21',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  attendeeCount: {
    fontSize: 16,
    color: '#666',
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  attendeeDepartment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  attendeeStudentId: {
    fontSize: 12,
    color: '#999',
  },
  attendeeActions: {
    paddingLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default EventAttendeesScreen; 
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Community data for lookup
const communitiesLookup: Record<string, { name: string; logo: string; color: string }> = {
  'cs': { name: 'Computer Science', logo: '💻', color: '#9a0f21' },
  'engineering': { name: 'Engineering', logo: '⚙️', color: '#ff6b35' },
  'sports': { name: 'Sports Club', logo: '⚽', color: '#34a853' },
  'music': { name: 'Music Society', logo: '🎵', color: '#9c27b0' },
  'debate': { name: 'Debate Club', logo: '🗣️', color: '#f44336' },
  'art': { name: 'Art Club', logo: '🎨', color: '#ff9800' },
  'all': { name: 'All', logo: '🏫', color: '#607d8b' },
};

const EventDetailScreen = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    thumbnail: string;
    community: string;
    communityId: string;
    communityLogo: string;
  }>();

  const {
    id,
    name,
    date,
    description,
    thumbnail,
    community,
    communityId,
    communityLogo,
  } = params;

  // State for event registration
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const communityData = communitiesLookup[communityId] || {
    name: community,
    logo: communityLogo,
    color: '#607d8b',
  };

  // Check if user is registered for the event
  const checkRegistration = async (eventId: string): Promise<boolean> => {
    if (!user || !eventId) return false;
    
    try {
      const { count, error } = await supabase
        .from('attenders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error checking registration:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  // Get attendee count for the event
  const getAttendeeCount = async (eventId: string): Promise<number> => {
    if (!eventId) return 0;
    
    try {
      const { count, error } = await supabase
        .from('attenders')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) {
        console.error('Error getting attendee count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting attendee count:', error);
      return 0;
    }
  };

  // Join event
  const joinEvent = async (eventId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join an event.');
      return false;
    }

    if (!eventId) {
      Alert.alert('Error', 'Event ID is required.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('attenders')
        .insert({
          user_id: user.id,
          event_id: eventId,
        });

      if (error) {
        console.error('Error joining event:', error);
        Alert.alert('Error', 'Failed to join event. Please try again.');
        return false;
      }

      Alert.alert('Success', 'You have successfully joined the event!');
      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event. Please try again.');
      return false;
    }
  };

  // Leave event
  const leaveEvent = async (eventId: string): Promise<boolean> => {
    if (!user || !eventId) return false;

    try {
      const { error } = await supabase
        .from('attenders')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error leaving event:', error);
        Alert.alert('Error', 'Failed to leave event. Please try again.');
        return false;
      }

      Alert.alert('Success', 'You have left the event.');
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
      return false;
    }
  };

  // Handle join/leave event
  const handleEventRegistration = async () => {
    if (!id) return;

    setRegistrationLoading(true);
    const currentStatus = isRegistered;
    
    // Optimistically update UI
    setIsRegistered(!currentStatus);
    setAttendeeCount(prev => currentStatus ? prev - 1 : prev + 1);

    let success = false;
    if (currentStatus) {
      // Leave event
      success = await leaveEvent(id);
    } else {
      // Join event
      success = await joinEvent(id);
    }

    if (!success) {
      // Revert optimistic update if operation failed
      setIsRegistered(currentStatus);
      setAttendeeCount(prev => currentStatus ? prev + 1 : prev - 1);
    }

    setRegistrationLoading(false);
  };

  // Fetch registration status and attendee count
  const fetchEventData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [registrationStatus, count] = await Promise.all([
        checkRegistration(id),
        getAttendeeCount(id),
      ]);

      setIsRegistered(registrationStatus);
      setAttendeeCount(count);
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    // Handle share logic
    console.log('Sharing event:', name);
  };

  if (!name) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
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
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Poster */}
        <View style={[styles.posterContainer, { backgroundColor: communityData.color }]}>
          <View style={styles.posterContent}>
            <Text style={styles.posterEmoji}>{thumbnail}</Text>
            <Text style={styles.posterTitle}>{name}</Text>
          </View>
          
          {/* Community Info Badge */}
          <TouchableOpacity 
            style={styles.communityBadge}
            onPress={() => router.push({
              pathname: '/(app)/(protected)/community/[id]',
              params: { id: communityId }
            })}
          >
            {communityData.logo.startsWith('http') ? (
              <Image source={{ uri: communityData.logo }} style={styles.communityLogoDetail} />
            ) : (
              <Text style={styles.communityIconInDetail}>{communityData.logo}</Text>
            )}
            <Text style={styles.communityName}>{communityData.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          {/* Date and Time */}
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>
          </View>

          {/* Community */}
          <TouchableOpacity style={styles.detailRow} onPress={() => router.push({
            pathname: '/(app)/(protected)/community/[id]',
            params: { id: communityId }
          })}>
            {communityData.logo.startsWith('http') ? (
              <Image source={{ uri: communityData.logo }} style={styles.communityLogoDetail} />
            ) : (
              <Text style={styles.communityIconInDetail}>{communityData.logo}</Text>
            )}
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Organized by</Text>
              <Text style={styles.detailValue}>{communityData.name}</Text>
            </View>
          </TouchableOpacity>

          {/* Attendee Count */}
          {loading ? (
            <View style={styles.detailRow}>
              <MaterialIcons name="people" size={24} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <ActivityIndicator size="small" color="#666" />
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.detailRow} 
              onPress={() => router.push({
                pathname: '/community/eventAttendees',
                params: {
                  eventId: id,
                  eventName: name,
                }
              })}
            >
              <MaterialIcons name="people" size={24} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{attendeeCount} registered</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this event</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              isRegistered && styles.leaveButton,
              registrationLoading && styles.disabledButton
            ]} 
            onPress={handleEventRegistration}
            disabled={registrationLoading}
          >
            {registrationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons 
                  name={isRegistered ? "person-remove" : "person-add"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.joinButtonText}>
                  {isRegistered ? "Leave Event" : "Join Event"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Event Guidelines */}
        <View style={styles.guidelinesContainer}>
          <Text style={styles.guidelinesTitle}>Event Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Please arrive 15 minutes before the event starts{'\n'}
            • Bring a valid student ID for verification{'\n'}
            • Follow university community guidelines{'\n'}
            • Respectful behavior is expected from all participants
          </Text>
        </View>
      </ScrollView>
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
  shareButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  posterContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  posterContent: {
    alignItems: 'center',
  },
  posterEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  posterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  communityBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  communityLogo: {
    fontSize: 16,
    marginRight: 6,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tagsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  communityIconInDetail: {
    fontSize: 24,
  },
  communityLogoDetail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 2,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  joinButton: {
    backgroundColor: '#9a0f21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  calendarButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9a0f21',
  },
  calendarButtonText: {
    color: '#9a0f21',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  guidelinesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
    backgroundColor: '#f8f9fa',
    marginTop: 16,
    marginBottom: 40,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default EventDetailScreen; 
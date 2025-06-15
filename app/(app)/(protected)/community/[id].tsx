import CommunityProfile from '@/components/community/CommunityProfile';
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Database Types
interface DatabaseCommunity {
  id: string;
  name: string;
  mail: string;
  description: string;
  logo: string; // storage path
}

interface DatabaseEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  photo: string; // storage path
  community_id: string;
}

// Community data structure (for CommunityProfile component compatibility)
interface Community {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
  bannerColor: string;
  eventCount: number;
  aboutText: string;
  contactInfo: {
    email: string;
    website: string;
  };
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  community: string;
  thumbnail: string;
  description: string;
}

// Type alias for CommunityProfile Event interface (without community property)
type CommunityEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  thumbnail: string;
  description: string;
};

const CommunityDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSupabase();

  // State for Supabase data
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL for images from Supabase storage
  const getImageUrl = async (path: string, bucket: string = 'community-assets'): Promise<string> => {
    try {
      if (!path) return '';
      
      // Try to get public URL first
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }

      // If public URL doesn't work, try signed URL (for private buckets)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        return '';
      }

      return signedData?.signedUrl || '';
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '';
    }
  };

  // Check if user is a member of the community
  const checkMembership = async (communityId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { count, error } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) {
        console.error('Error checking membership:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  };

  // Get member count for the community
  const getMemberCount = async (communityId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId);

      if (error) {
        console.error('Error getting member count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  };

  // Join community
  const joinCommunity = async (communityId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a community.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: communityId,
        });

      if (error) {
        console.error('Error joining community:', error);
        Alert.alert('Error', 'Failed to join community. Please try again.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community. Please try again.');
      return false;
    }
  };

  // Leave community
  const leaveCommunity = async (communityId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) {
        console.error('Error leaving community:', error);
        Alert.alert('Error', 'Failed to leave community. Please try again.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      Alert.alert('Error', 'Failed to leave community. Please try again.');
      return false;
    }
  };

  // Handle follow/unfollow action
  const handleMembershipToggle = async () => {
    if (!community) return;

    const currentStatus = community.isFollowing;
    
    // Optimistically update UI
    setCommunity(prev => prev ? {
      ...prev,
      isFollowing: !currentStatus,
      memberCount: currentStatus ? prev.memberCount - 1 : prev.memberCount + 1
    } : null);

    let success = false;
    if (currentStatus) {
      // Leave community
      success = await leaveCommunity(community.id);
    } else {
      // Join community
      success = await joinCommunity(community.id);
    }

    if (!success) {
      // Revert optimistic update if operation failed
      setCommunity(prev => prev ? {
        ...prev,
        isFollowing: currentStatus,
        memberCount: currentStatus ? prev.memberCount + 1 : prev.memberCount - 1
      } : null);
    }
  };

  // Fetch community details and its events
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Community ID is required');
      }

      // Fetch specific community
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (communityError) {
        throw communityError;
      }

      if (!communityData) {
        throw new Error('Community not found');
      }

      // Fetch events for this community (only upcoming events)
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('community_id', id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      // Check membership and get member count
      const [isFollowing, memberCount] = await Promise.all([
        checkMembership(id),
        getMemberCount(id),
      ]);
      
      const processedCommunity: Community = {
        id: communityData.id,
        name: communityData.name,
        logo: communityData.logo || '🛖', // fallback emoji if no image
        description: communityData.description,
        memberCount: memberCount,
        isFollowing: isFollowing,
        bannerColor: '#9a0f21', // You might want to add this to your database
        eventCount: (eventsData || []).length,
        aboutText: communityData.description,
        contactInfo: {
          email: communityData.mail,
          website: '', // You might want to add this to your database
        },
      };

      // Process events data
      const processedEvents = await Promise.all(
        (eventsData || []).map(async (event: DatabaseEvent) => {
          const photoUrl = await getImageUrl(event.photo, 'community-assets');
          
          return {
            id: event.id,
            name: event.title,
            date: new Date(event.start_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            location: 'TBA', // You might want to add a location field to your events table
            community: communityData.name,
            thumbnail: photoUrl || '📅', // fallback emoji if no image
            description: event.description || 'No description available',
          };
        })
      );

      setCommunity(processedCommunity);
      setEvents(processedEvents);
    } catch (error: any) {
      console.error('Error fetching community data:', error);
      setError(error.message || 'Failed to fetch community data');
      Alert.alert('Error', 'Failed to load community details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleEventPress = (event: CommunityEvent) => {
    // Navigate to event detail screen with event data
    router.push({
      pathname: '/(app)/(protected)/community/eventDetail',
      params: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        description: event.description,
        thumbnail: event.thumbnail,
        community: community?.name,
        communityId: id,
        communityLogo: community?.logo || '🛖'
      }
    });
  };

  const handleRetry = () => {
    fetchCommunityData();
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading community details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !community) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#f44336" />
          <Text style={styles.errorText}>
            {error || 'Community not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
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
        <Text style={styles.headerTitle}>{community.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <CommunityProfile 
        community={community}
        events={events}
        onEventPress={handleEventPress}
        onMembershipToggle={handleMembershipToggle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 32,
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
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
});

export default CommunityDetailScreen; 
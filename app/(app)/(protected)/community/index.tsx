import FiltersModal from '@/components/community/FiltersModal';
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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

// UI Types (keeping the same structure for compatibility)
interface Community {
  id: string;
  name: string;
  logo: string; // Will contain full URL after processing
  memberCount: number;
  isFollowing: boolean;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  community: Community;
  thumbnail: string;
  description: string;
}

interface FilterState {
  followStatus: 'all' | 'following' | 'not_following';
  selectedCommunities: string[];
}

// Extended community type with events
interface CommunityWithEvents extends DatabaseCommunity {
  logo_url: string;
  events: DatabaseEvent[];
}

const filterTags: string[] = ['All Events', 'Following Communities', 'Registered Events', 'Not Following Communities', 'Not Registered Events'];

const CommunityEventFeed = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('All Events');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    followStatus: 'all',
    selectedCommunities: [],
  });

  // State for Supabase data
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // Store all events for filtering
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]); // User's registered event IDs
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Fetch user's community memberships
  const fetchUserMemberships = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user memberships:', error);
        return [];
      }

      return (data || []).map(membership => membership.community_id);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      return [];
    }
  };

  // Fetch user's event registrations
  const fetchUserRegistrations = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('attenders')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user registrations:', error);
        return [];
      }

      return (data || []).map(registration => registration.event_id);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      return [];
    }
  };

  // Fetch member count for each community
  const fetchMemberCounts = async (communityIds: string[]): Promise<Record<string, number>> => {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .in('community_id', communityIds);

      if (error) {
        console.error('Error fetching member counts:', error);
        return {};
      }

      // Count members for each community
      const counts: Record<string, number> = {};
      (data || []).forEach(member => {
        counts[member.community_id] = (counts[member.community_id] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error fetching member counts:', error);
      return {};
    }
  };

  // Fetch communities and their upcoming events
  const fetchCommunitiesAndEvents = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*')
        .order('name');

      if (communitiesError) {
        throw communitiesError;
      }

      // Fetch upcoming events (only events where start_time >= now())
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          communities:community_id (
            id,
            name,
            logo
          )
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      // Fetch user memberships, registrations, and member counts
      const userMemberships = await fetchUserMemberships();
      const userEventRegistrations = await fetchUserRegistrations();
      const communityIds = (communitiesData || []).map(c => c.id);
      const memberCounts = await fetchMemberCounts(communityIds);

      // Process communities data and get logo URLs
      const processedCommunities = await Promise.all(
        (communitiesData || []).map(async (community: DatabaseCommunity) => {
          return {
            id: community.id,
            name: community.name,
            logo: community.logo || '🏢', // fallback emoji if no image
            memberCount: memberCounts[community.id] || 0,
            isFollowing: userMemberships.includes(community.id),
          };
        })
      );

      // Process events data and get photo URLs
      const processedEvents = await Promise.all(
        (eventsData || []).map(async (event: any) => {
          const photoUrl = await getImageUrl(event.photo, 'community-assets');
          
          // Format the event to match the existing UI structure
          return {
            id: event.id,
            name: event.title,
            date: new Date(event.start_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            location: 'TBA', // You might want to add a location field to your events table
            community: event.communities,
            thumbnail: photoUrl || '📅', // fallback emoji if no image
            description: event.description || 'No description available',
          };
        })
      );

      setCommunities(processedCommunities);
      setAllEvents(processedEvents); // Store all events
      setUserRegistrations(userEventRegistrations); // Store user registrations
      setEvents(processedEvents); // Initially show all events
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
      Alert.alert('Error', 'Failed to load communities and events. Please try again.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchCommunitiesAndEvents(true);
  };

  // Handle retry button press
  const handleRetry = () => {
    fetchCommunitiesAndEvents(false);
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchCommunitiesAndEvents();
  }, []);

  // Filter events based on selected filter
  const filterEvents = React.useCallback((filterType: string): Event[] => {
    switch (filterType) {
      case 'All Events':
        return allEvents;
      
      case 'Following Communities':
        return allEvents.filter(event => {
          const community = communities.find(c => c.id === event.community.id);
          return community?.isFollowing || false;
        });
      
      case 'Registered Events':
        return allEvents.filter(event => userRegistrations.includes(event.id));
      
      case 'Not Following Communities':
        return allEvents.filter(event => {
          const community = communities.find(c => c.id === event.community.id);
          return !community?.isFollowing;
        });
      
      case 'Not Registered Events':
        return allEvents.filter(event => !userRegistrations.includes(event.id));
      
      default:
        return allEvents;
    }
  }, [allEvents, communities, userRegistrations]);

  // Update events when filter changes
  React.useEffect(() => {
    const filteredEvents = filterEvents(selectedFilter);
    setEvents(filteredEvents);
  }, [selectedFilter, filterEvents]);

  // Create a lookup map for community name to ID
  const communityNameToId: Record<string, string> = React.useMemo(() => {
    const lookup: Record<string, string> = {};
    communities.forEach(community => {
      lookup[community.name] = community.id;
    });
    return lookup;
  }, [communities]);

  const renderCommunityIcon = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={[
        styles.communityIcon,
        selectedCommunity === item.id && styles.selectedCommunityIcon
      ]}
      onPress={() => {
        router.push(`/(app)/(protected)/community/${item.id}`);
      }}
    >
      <View style={[
        styles.communityLogoContainer,
        selectedCommunity === item.id && styles.selectedCommunityLogoContainer
      ]}>
        <View>
          {item.logo.startsWith('http') ? (
            <Image
              source={{ uri: item.logo }}
              style={{width: 50, height: 50, borderRadius: 25}}
            />
          ) : (
            <Text className='text-2xl'>🛖</Text>
          )}
        </View>
      </View>
      <Text style={styles.communityName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterTag = (tag: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.filterTag,
        selectedFilter === tag && styles.selectedFilterTag
      ]}
      onPress={() => setSelectedFilter(tag)}
    >
      <Text style={[
        styles.filterTagText,
        selectedFilter === tag && styles.selectedFilterTagText
      ]}>
        {tag}
      </Text>
    </TouchableOpacity>
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => {
        // Navigate to event detail screen with event data
        router.push({
          pathname: '/(app)/(protected)/community/eventDetail',
          params: {
            id: item.id,
            name: item.name,
            date: item.date,
            location: item.location,
            description: item.description,
            thumbnail: item.thumbnail,
            community: item.community.name,
            communityId: item.community.id,
            communityLogo: item.community.logo,
          }
        });
      }}
    >
      <View style={styles.eventThumbnail}>
        <Text style={styles.eventThumbnailText}>
          {item.thumbnail.startsWith('http') ? '📅' : item.thumbnail}
        </Text>
      </View>
      <View style={styles.eventDetails}>
        <View className='flex-col justify-start'>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
        </View>
        <Text style={styles.eventCommunity}>{item.community.name}</Text>
      </View>
    </TouchableOpacity>
  );


  const handleFiltersApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    
    // Apply advanced filters on top of basic filter
    let filteredEvents = filterEvents(selectedFilter);
    
    // Further filter by selected communities if any are chosen
    if (filters.selectedCommunities.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.selectedCommunities.includes(event.community.id)
      );
    }
    
    setEvents(filteredEvents);
  };

  const openFiltersModal = () => {
    setShowFiltersModal(true);
  };

  const closeFiltersModal = () => {
    setShowFiltersModal(false);
  };

  const navigateToCommunitiesList = () => {
    router.push('/(app)/(protected)/community/list');
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#9a0f21" />
        <Text style={styles.loadingText}>Loading communities...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <MaterialIcons name="error-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.communitiesButton} onPress={navigateToCommunitiesList}>
            <MaterialIcons name="people" size={24} color="#9a0f21" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={openFiltersModal}>
            <MaterialIcons name="tune" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Communities Row */}
      <View style={styles.communitiesSection}>
        <FlatList
          data={communities}
          renderItem={renderCommunityIcon}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.communitiesList}
        />
      </View>

      {/* Filter Tags Row */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        >
          {filterTags.map(renderFilterTag)}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No upcoming events found</Text>
            <Text style={styles.emptySubtext}>Check back later for new events!</Text>
          </View>
        }
      />

      {/* Filters Modal */}
      <FiltersModal
        visible={showFiltersModal}
        onClose={closeFiltersModal}
        onApply={handleFiltersApply}
        communities={communities}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communitiesButton: {
    padding: 8,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
  },
  communitiesSection: {
    paddingVertical: 15,
  },
  communitiesList: {
    paddingHorizontal: 20,
  },
  communityIcon: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  selectedCommunityIcon: {
    opacity: 1,
  },
  communityLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCommunityLogoContainer: {
    borderColor: '#9a0f21',
    backgroundColor: '#e3f2fd',
  },
  communityLogo: {
    fontSize: 24,
  },
  communityName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  filtersSection: {
    paddingVertical: 10,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  selectedFilterTag: {
    backgroundColor: '#9a0f21',
  },
  filterTagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterTagText: {
    color: '#fff',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weekArrow: {
    padding: 10,
  },
  weekText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventThumbnailText: {
    fontSize: 32,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventCommunity: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '500',
  },
});

export default CommunityEventFeed; 
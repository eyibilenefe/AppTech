import FiltersModal from '@/components/community/FiltersModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types
interface Community {
  id: string;
  name: string;
  logo: string;
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

interface FilterState {
  followStatus: 'all' | 'following' | 'not_following';
  selectedCommunities: string[];
  eventTypes: string[];
}

// Mock data
const communities: Community[] = [
  { id: 'cs', name: 'Software Society', logo: '💻' },
  { id: 'engineering', name: 'Engineering', logo: '⚙️' },
  { id: 'sports', name: 'Sports Club', logo: '⚽' },
  { id: 'music', name: 'Music Society', logo: '🎵' },
  { id: 'debate', name: 'Debate Club', logo: '🗣️' },
  { id: 'art', name: 'Art Club', logo: '🎨' },
];

// Create a lookup map for community name to ID
const communityNameToId: Record<string, string> = {
  'Computer Science': 'cs',
  'Engineering': 'engineering', 
  'Sports Club': 'sports',
  'Music Society': 'music',
  'Debate Club': 'debate',
  'Art Club': 'art',
};

const filterTags: string[] = ['All Events', 'Following', 'Sports', 'Science', 'Arts', 'Music', 'Technology'];

const events: Event[] = [
  {
    id: '1',
    name: 'React Native Workshop',
    date: 'Dec 15, 2024',
    location: 'Computer Lab 101',
    community: 'Computer Science',
    thumbnail: '💻',
    description: 'Learn React Native development basics',
  },
  {
    id: '2',
    name: 'Basketball Tournament',
    date: 'Dec 16, 2024',
    location: 'Sports Center',
    community: 'Sports Club',
    thumbnail: '🏀',
    description: 'Inter-department basketball competition',
  },
  {
    id: '3',
    name: 'Music Concert',
    date: 'Dec 17, 2024',
    location: 'Main Auditorium',
    community: 'Music Society',
    thumbnail: '🎤',
    description: 'Annual winter music concert',
  },
  {
    id: '4',
    name: 'Art Exhibition',
    date: 'Dec 18, 2024',
    location: 'Gallery Hall',
    community: 'Art Club',
    thumbnail: '🎨',
    description: 'Student artwork showcase',
  },
  {
    id: '5',
    name: 'Debate Championship',
    date: 'Dec 19, 2024',
    location: 'Conference Room A',
    community: 'Debate Club',
    thumbnail: '🗣️',
    description: 'Annual debate championship finals',
  },
];

const CommunityEventFeed = () => {
  const router = useRouter();
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('All Events');
  const [currentWeek, setCurrentWeek] = useState('This Week');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    followStatus: 'all',
    selectedCommunities: [],
    eventTypes: [],
  });

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
        <Text style={styles.communityLogo}>{item.logo}</Text>
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
            community: item.community,
            // Use the lookup map for better accuracy
            communityId: communityNameToId[item.community] || 'unknown'
          }
        });
      }}
    >
      <View style={styles.eventThumbnail}>
        <Text style={styles.eventThumbnailText}>{item.thumbnail}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
        <Text style={styles.eventCommunity}>{item.community}</Text>
      </View>
    </TouchableOpacity>
  );

  const changeWeek = (direction: 'left' | 'right') => {
    // Handle week navigation logic here
    console.log(`Navigate week ${direction}`);
  };

  const handleFiltersApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    // Here you would filter the events based on the applied filters
    console.log('Applied filters:', filters);
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

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={styles.weekArrow}
          onPress={() => changeWeek('left')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.weekText}>{currentWeek}</Text>
        <TouchableOpacity
          style={styles.weekArrow}
          onPress={() => changeWeek('right')}
        >
          <MaterialIcons name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />

      {/* Filters Modal */}
      <FiltersModal
        visible={showFiltersModal}
        onClose={closeFiltersModal}
        onApply={handleFiltersApply}
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
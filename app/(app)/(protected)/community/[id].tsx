import CommunityProfile from '@/components/community/CommunityProfile';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Community data structure
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

// Extended community data with additional fields
const communitiesData: Record<string, Community> = {
  'cs': {
    id: 'cs',
    name: 'Computer Science Club',
    logo: '💻',
    description: 'Programming, hackathons, and tech discussions',
    memberCount: 234,
    isFollowing: true,
    bannerColor: '#4285f4',
    eventCount: 8,
    aboutText: 'The Computer Science Club is dedicated to fostering a community of passionate programmers, developers, and tech enthusiasts. We organize hackathons, coding workshops, tech talks, and networking events throughout the academic year.',
    contactInfo: {
      email: 'cs-club@university.edu',
      website: 'https://cs-club.university.edu',
    },
  },
  'engineering': {
    id: 'engineering',
    name: 'Engineering Society',
    logo: '⚙️',
    description: 'Innovation and engineering excellence',
    memberCount: 178,
    isFollowing: false,
    bannerColor: '#ff6b35',
    eventCount: 6,
    aboutText: 'The Engineering Society brings together students from all engineering disciplines to share knowledge, collaborate on projects, and prepare for professional careers in engineering.',
    contactInfo: {
      email: 'engineering@university.edu',
      website: 'https://engineering.university.edu',
    },
  },
  'sports': {
    id: 'sports',
    name: 'Sports Club',
    logo: '⚽',
    description: 'Athletic excellence and team spirit',
    memberCount: 156,
    isFollowing: true,
    bannerColor: '#34a853',
    eventCount: 12,
    aboutText: 'Our Sports Club promotes physical fitness, teamwork, and competitive spirit through various athletic activities and tournaments.',
    contactInfo: {
      email: 'sports@university.edu',
      website: 'https://sports.university.edu',
    },
  },
  'music': {
    id: 'music',
    name: 'Music Society',
    logo: '🎵',
    description: 'Musical performances and appreciation',
    memberCount: 201,
    isFollowing: true,
    bannerColor: '#9c27b0',
    eventCount: 5,
    aboutText: 'The Music Society celebrates musical talent and provides a platform for students to showcase their musical abilities through concerts, recitals, and jam sessions.',
    contactInfo: {
      email: 'music@university.edu',
      website: 'https://music.university.edu',
    },
  },
  'debate': {
    id: 'debate',
    name: 'Debate Club',
    logo: '🗣️',
    description: 'Improve public speaking and critical thinking',
    memberCount: 67,
    isFollowing: false,
    bannerColor: '#f44336',
    eventCount: 4,
    aboutText: 'The Debate Club enhances students\' public speaking skills, critical thinking abilities, and argumentation techniques through regular debates and competitions.',
    contactInfo: {
      email: 'debate@university.edu',
      website: 'https://debate.university.edu',
    },
  },
  'art': {
    id: 'art',
    name: 'Art Club',
    logo: '🎨',
    description: 'Creative expression through various art forms',
    memberCount: 156,
    isFollowing: false,
    bannerColor: '#ff9800',
    eventCount: 7,
    aboutText: 'The Art Club provides a creative space for students to explore various art forms, from painting and sculpture to digital art and photography.',
    contactInfo: {
      email: 'art@university.edu',
      website: 'https://art.university.edu',
    },
  },
  'all': {
    id: 'all',
    name: 'All Communities',
    logo: '🏫',
    description: 'View all community events',
    memberCount: 0,
    isFollowing: false,
    bannerColor: '#607d8b',
    eventCount: 0,
    aboutText: 'Browse events from all communities on campus.',
    contactInfo: {
      email: '',
      website: '',
    },
  },
};

// Events data organized by community
const eventsData: Record<string, Event[]> = {
  'cs': [
    {
      id: '1',
      name: 'React Native Workshop',
      date: 'Dec 15, 2024',
      location: 'Computer Lab 101',
      community: 'Computer Science Club',
      thumbnail: '💻',
      description: 'Learn React Native development basics',
    },
    {
      id: '6',
      name: 'Machine Learning Seminar',
      date: 'Dec 22, 2024',
      location: 'Lecture Hall B',
      community: 'Computer Science Club',
      thumbnail: '🤖',
      description: 'Introduction to ML algorithms and applications',
    },
  ],
  'sports': [
    {
      id: '2',
      name: 'Basketball Tournament',
      date: 'Dec 16, 2024',
      location: 'Sports Center',
      community: 'Sports Club',
      thumbnail: '🏀',
      description: 'Inter-department basketball competition',
    },
  ],
  'music': [
    {
      id: '3',
      name: 'Music Concert',
      date: 'Dec 17, 2024',
      location: 'Main Auditorium',
      community: 'Music Society',
      thumbnail: '🎤',
      description: 'Annual winter music concert',
    },
  ],
  'art': [
    {
      id: '4',
      name: 'Art Exhibition',
      date: 'Dec 18, 2024',
      location: 'Gallery Hall',
      community: 'Art Club',
      thumbnail: '🎨',
      description: 'Student artwork showcase',
    },
  ],
  'debate': [
    {
      id: '5',
      name: 'Debate Championship',
      date: 'Dec 19, 2024',
      location: 'Conference Room A',
      community: 'Debate Club',
      thumbnail: '🗣️',
      description: 'Annual debate championship finals',
    },
  ],
  'engineering': [],
};

const CommunityDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const community = communitiesData[id];
  const events = eventsData[id] || [];

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
        community: community.name, // Use the current community name
        communityId: id // Use the current community ID
      }
    });
  };

  if (!community) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Community not found</Text>
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
});

export default CommunityDetailScreen; 
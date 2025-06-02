import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  thumbnail: string;
  description: string;
}

interface Community {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
  description: string;
  memberCount: number;
  eventCount: number;
  isFollowing: boolean;
}

interface CommunityProfileProps {
  community: Community;
  events?: Event[]; // Optional events prop
  onEventPress?: (event: Event) => void;
}

const defaultMockEvents: Event[] = [
  {
    id: '1',
    name: 'React Native Workshop',
    date: 'Dec 15, 2024',
    location: 'Computer Lab 101',
    thumbnail: '💻',
    description: 'Learn React Native development basics',
  },
  {
    id: '2',
    name: 'Web Development Bootcamp',
    date: 'Dec 20, 2024',
    location: 'Conference Room A',
    thumbnail: '🌐',
    description: 'Intensive web development training',
  },
  {
    id: '3',
    name: 'AI & Machine Learning Talk',
    date: 'Dec 25, 2024',
    location: 'Main Auditorium',
    thumbnail: '🤖',
    description: 'Future of artificial intelligence',
  },
];

const CommunityProfile: React.FC<CommunityProfileProps> = ({ 
  community, 
  events = defaultMockEvents, // Use provided events or default to mock events
  onEventPress 
}) => {
  const [isFollowing, setIsFollowing] = useState(community.isFollowing);

  const handleFollowPress = () => {
    setIsFollowing(!isFollowing);
    // Here you would typically make an API call to follow/unfollow
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onEventPress?.(item)}
    >
      <View style={styles.eventThumbnail}>
        <Text style={styles.eventThumbnailText}>{item.thumbnail}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: community.bannerColor }]}>
          <View style={styles.bannerGradient} />
        </View>

        {/* Community Info */}
        <View style={styles.communityInfo}>
          <View style={styles.logoContainer}>
            <View style={styles.communityLogo}>
              <Text style={styles.communityLogoText}>{community.logo}</Text>
            </View>
          </View>
          
          <View style={styles.communityDetails}>
            <Text style={styles.communityName}>{community.name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{community.memberCount}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{community.eventCount}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={handleFollowPress}
          >
            <MaterialIcons 
              name={isFollowing ? "check" : "add"} 
              size={20} 
              color={isFollowing ? "#9a0f21" : "#fff"} 
            />
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{community.description}</Text>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {events.length > 0 ? 'Upcoming Events' : 'No Events Scheduled'}
            </Text>
            {events.length > 3 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {events.length > 0 ? (
            <FlatList
              data={events}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.eventSeparator} />}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>
                No events scheduled for this community yet.
              </Text>
            </View>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>Engineering Building, Room 205</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color="#666" />
            <Text style={styles.infoText}>Meetings: Every Wednesday 6:00 PM</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#666" />
            <Text style={styles.infoText}>contact@computerscience.edu</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="language" size={20} color="#666" />
            <Text style={styles.infoText}>www.computerscience.edu</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  banner: {
    height: 120,
    position: 'relative',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  communityInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  communityLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityLogoText: {
    fontSize: 32,
  },
  communityDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  communityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9a0f21',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'center',
  },
  followingButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#9a0f21',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  followingButtonText: {
    color: '#9a0f21',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#9a0f21',
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  eventThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventThumbnailText: {
    fontSize: 20,
  },
  eventDetails: {
    flex: 1,
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
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  noEventsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  additionalInfo: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
});

export default CommunityProfile; 
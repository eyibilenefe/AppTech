import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Community data for lookup
const communitiesLookup: Record<string, { name: string; logo: string; color: string }> = {
  'cs': { name: 'Computer Science', logo: '💻', color: '#4285f4' },
  'engineering': { name: 'Engineering', logo: '⚙️', color: '#ff6b35' },
  'sports': { name: 'Sports Club', logo: '⚽', color: '#34a853' },
  'music': { name: 'Music Society', logo: '🎵', color: '#9c27b0' },
  'debate': { name: 'Debate Club', logo: '🗣️', color: '#f44336' },
  'art': { name: 'Art Club', logo: '🎨', color: '#ff9800' },
  'all': { name: 'All', logo: '🏫', color: '#607d8b' },
};

const EventDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    thumbnail: string;
    community: string;
    communityId: string;
  }>();

  const {
    id,
    name,
    date,
    location,
    description,
    thumbnail,
    community,
    communityId,
  } = params;

  const communityData = communitiesLookup[communityId] || {
    name: community,
    logo: '🏫',
    color: '#607d8b',
  };

  const handleBack = () => {
    router.back();
  };

  const handleJoin = () => {
    // Handle join event logic
    console.log('Joining event:', name);
    // In a real app, this would make an API call
  };

  const handleAddToCalendar = () => {
    // Handle add to calendar logic
    console.log('Adding to calendar:', name);
  };

  const handleShare = () => {
    // Handle share logic
    console.log('Sharing event:', name);
  };

  // Generate some sample tags based on the event
  const generateTags = () => {
    const tags = [];
    if (communityId === 'cs') tags.push('Technology', 'Programming', 'Learning');
    else if (communityId === 'sports') tags.push('Sports', 'Competition', 'Team');
    else if (communityId === 'music') tags.push('Music', 'Performance', 'Arts');
    else if (communityId === 'art') tags.push('Art', 'Creative', 'Exhibition');
    else if (communityId === 'debate') tags.push('Debate', 'Speaking', 'Competition');
    else tags.push('Event', 'University', 'Community');
    
    return tags;
  };

  const eventTags = generateTags();

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
          <View style={styles.communityBadge}>
            <Text style={styles.communityLogo}>{communityData.logo}</Text>
            <Text style={styles.communityName}>{communityData.name}</Text>
          </View>
        </View>

        {/* Event Tags */}
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {eventTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
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

          {/* Location */}
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{location}</Text>
            </View>
          </View>

          {/* Community */}
          <View style={styles.detailRow}>
            <Text style={styles.communityIconInDetail}>{communityData.logo}</Text>
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Organized by</Text>
              <Text style={styles.detailValue}>{communityData.name}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this event</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <MaterialIcons name="person-add" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
            <MaterialIcons name="calendar-today" size={20} color="#007bff" />
            <Text style={styles.calendarButtonText}>Add to Calendar</Text>
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
    backgroundColor: '#007bff',
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
  calendarButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  calendarButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  guidelinesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
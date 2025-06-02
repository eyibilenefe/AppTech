import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  community: {
    name: string;
    logo: string;
  };
  thumbnail: string;
  description: string;
  tags: string[];
  attendeeCount: number;
  isJoined: boolean;
  posterColor: string;
}

interface EventDetailProps {
  event: Event;
  onBack?: () => void;
  onCommunityPress?: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ 
  event, 
  onBack, 
  onCommunityPress 
}) => {
  const [isJoined, setIsJoined] = useState(event.isJoined);

  const handleJoinPress = () => {
    setIsJoined(!isJoined);
    // Here you would typically make an API call to join/leave event
  };

  const handleShare = () => {
    // Handle share functionality
    console.log('Share event');
  };

  const handleAddToCalendar = () => {
    // Handle add to calendar functionality
    console.log('Add to calendar');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Poster */}
        <View style={[styles.poster, { backgroundColor: event.posterColor }]}>
          <View style={styles.posterContent}>
            <Text style={styles.posterEmoji}>{event.thumbnail}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{event.name}</Text>
          
          {/* Community Info */}
          <TouchableOpacity 
            style={styles.communityInfo}
            onPress={onCommunityPress}
          >
            <View style={styles.communityLogo}>
              <Text style={styles.communityLogoText}>{event.community.logo}</Text>
            </View>
            <Text style={styles.communityName}>{event.community.name}</Text>
            <MaterialIcons name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          {/* Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {event.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{event.date} at {event.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="people" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{event.attendeeCount} people going</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleAddToCalendar}
            >
              <MaterialIcons name="event" size={20} color="#9a0f21" />
              <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color="#9a0f21" />
              <Text style={styles.secondaryButtonText}>Share Event</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.sectionTitle}>Event Guidelines</Text>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={16} color="#4caf50" />
              <Text style={styles.guidelineText}>Free admission for all students</Text>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={16} color="#4caf50" />
              <Text style={styles.guidelineText}>Bring your student ID</Text>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={16} color="#4caf50" />
              <Text style={styles.guidelineText}>Refreshments will be provided</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Join Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.joinButton,
            isJoined && styles.joinedButton,
          ]}
          onPress={handleJoinPress}
        >
          <MaterialIcons 
            name={isJoined ? "check" : "add"} 
            size={20} 
            color={isJoined ? "#4caf50" : "#fff"} 
          />
          <Text style={[
            styles.joinButtonText,
            isJoined && styles.joinedButtonText,
          ]}>
            {isJoined ? "Joined" : "Join Event"}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  poster: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterContent: {
    alignItems: 'center',
  },
  posterEmoji: {
    fontSize: 80,
  },
  eventInfo: {
    padding: 20,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  communityLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  communityLogoText: {
    fontSize: 16,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9a0f21',
    flex: 1,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.48,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#9a0f21',
    fontWeight: '500',
    marginLeft: 8,
  },
  additionalInfo: {
    marginBottom: 20,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9a0f21',
    paddingVertical: 16,
    borderRadius: 12,
  },
  joinedButton: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  joinedButtonText: {
    color: '#4caf50',
  },
});

export default EventDetail; 
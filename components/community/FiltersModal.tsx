import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Community {
  id: string;
  name: string;
  logo: string;
}

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

interface FilterState {
  followStatus: 'all' | 'following' | 'not_following';
  selectedCommunities: string[];
  eventTypes: string[];
}

const communities: Community[] = [
  { id: 'cs', name: 'Computer Science', logo: '💻' },
  { id: 'engineering', name: 'Engineering', logo: '⚙️' },
  { id: 'sports', name: 'Sports Club', logo: '⚽' },
  { id: 'music', name: 'Music Society', logo: '🎵' },
  { id: 'debate', name: 'Debate Club', logo: '🗣️' },
  { id: 'art', name: 'Art Club', logo: '🎨' },
  { id: 'science', name: 'Science Club', logo: '🔬' },
  { id: 'literature', name: 'Literature Club', logo: '📚' },
];

const eventTypes: string[] = [
  'Workshop',
  'Competition',
  'Concert',
  'Exhibition',
  'Seminar',
  'Social',
  'Sports',
  'Academic',
];

const FiltersModal: React.FC<FiltersModalProps> = ({ visible, onClose, onApply }) => {
  const [followStatus, setFollowStatus] = useState<'all' | 'following' | 'not_following'>('all');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleApply = () => {
    onApply({
      followStatus,
      selectedCommunities,
      eventTypes: selectedEventTypes,
    });
    onClose();
  };

  const clearFilters = () => {
    setFollowStatus('all');
    setSelectedCommunities([]);
    setSelectedEventTypes([]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Follow Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Status</Text>
            <View style={styles.followStatusContainer}>
              {[
                { key: 'all', label: 'All', icon: 'list' },
                { key: 'following', label: 'Following', icon: 'favorite' },
                { key: 'not_following', label: 'Not Following', icon: 'favorite-border' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.followStatusOption,
                    followStatus === option.key && styles.selectedFollowStatus,
                  ]}
                  onPress={() => setFollowStatus(option.key as any)}
                >
                  <MaterialIcons 
                    name={option.icon as any} 
                    size={18} 
                    color={followStatus === option.key ? '#fff' : '#666'} 
                  />
                  <Text
                    style={[
                      styles.followStatusText,
                      followStatus === option.key && styles.selectedFollowStatusText,
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Communities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communities</Text>
            <Text style={styles.sectionSubtitle}>Select communities to filter events</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.communitiesScroll}
              contentContainerStyle={styles.communitiesScrollContent}
            >
              {communities.map(community => (
                <TouchableOpacity
                  key={community.id}
                  style={[
                    styles.communityItem,
                    selectedCommunities.includes(community.id) && styles.selectedCommunity,
                  ]}
                  onPress={() => toggleCommunity(community.id)}
                >
                  <View style={[
                    styles.communityLogo,
                    selectedCommunities.includes(community.id) && styles.selectedCommunityLogo,
                  ]}>
                    <Text style={styles.communityLogoText}>{community.logo}</Text>
                  </View>
                  <Text style={styles.communityName} numberOfLines={2}>
                    {community.name}
                  </Text>
                  {selectedCommunities.includes(community.id) && (
                    <View style={styles.selectedIndicator}>
                      <MaterialIcons name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Event Types Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Types</Text>
            <Text style={styles.sectionSubtitle}>Choose event categories you're interested in</Text>
            <View style={styles.eventTypesContainer}>
              {eventTypes.map(eventType => (
                <TouchableOpacity
                  key={eventType}
                  style={[
                    styles.eventTypeTag,
                    selectedEventTypes.includes(eventType) && styles.selectedEventType,
                  ]}
                  onPress={() => toggleEventType(eventType)}
                >
                  <Text
                    style={[
                      styles.eventTypeText,
                      selectedEventTypes.includes(eventType) && styles.selectedEventTypeText,
                    ]}
                  >
                    {eventType}
                  </Text>
                  {selectedEventTypes.includes(eventType) && (
                    <MaterialIcons name="check" size={16} color="#fff" style={styles.eventTypeCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <MaterialIcons name="filter-list" size={20} color="#fff" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  followStatusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  followStatusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minHeight: 48,
    gap: 6,
  },
  selectedFollowStatus: {
    backgroundColor: '#007bff',
  },
  followStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  selectedFollowStatusText: {
    color: '#fff',
  },
  communitiesScroll: {
    flexGrow: 0,
  },
  communitiesScrollContent: {
    paddingRight: 20,
  },
  communityItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 90,
    position: 'relative',
  },
  selectedCommunity: {
    opacity: 1,
  },
  communityLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCommunityLogo: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  communityLogoText: {
    fontSize: 22,
  },
  communityName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
    lineHeight: 14,
    height: 28,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  eventTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    minHeight: 40,
  },
  selectedEventType: {
    backgroundColor: '#007bff',
  },
  eventTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedEventTypeText: {
    color: '#fff',
  },
  eventTypeCheck: {
    marginLeft: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FiltersModal; 
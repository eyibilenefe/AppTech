import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Image,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Community {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
}

interface CommunitiesListProps {
  communities?: Community[]; // Make communities optional with default fallback
  onCommunityPress?: (community: Community) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Default mock communities as fallback
const defaultCommunities: Community[] = [
  {
    id: 'art',
    name: 'Art Club',
    logo: '🎨',
    description: 'Creative expression through various art forms',
    memberCount: 156,
    isFollowing: false,
  },
  {
    id: 'basketball',
    name: 'Basketball Team',
    logo: '🏀',
    description: 'University basketball team and enthusiasts',
    memberCount: 89,
    isFollowing: true,
  },
  {
    id: 'cs',
    name: 'Computer Science Club',
    logo: '💻',
    description: 'Programming, hackathons, and tech discussions',
    memberCount: 234,
    isFollowing: true,
  },
];

const CommunitiesList: React.FC<CommunitiesListProps> = ({ 
  communities = defaultCommunities, // Use provided communities or default to mock
  onCommunityPress, 
  onBack,
  showBackButton = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Filter and group communities
  const filteredAndGroupedCommunities = useMemo(() => {
    const filtered = communities.filter(community =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by first letter
    const grouped = filtered.reduce((acc, community) => {
      const firstLetter = community.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(community);
      return acc;
    }, {} as Record<string, Community[]>);

    // Convert to section list format
    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [searchQuery, communities]);

  // Generate alphabet index
  const alphabetIndex = useMemo(() => {
    const letters = new Set(communities.map(c => c.name[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [communities]);

  const scrollToSection = (letter: string) => {
    setSelectedLetter(letter);
    // In a real implementation, you would use a ref to scroll to the section
    console.log(`Scroll to section: ${letter}`);
  };

  const renderCommunityItem = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() => onCommunityPress?.(item)}
    >
      <View style={styles.communityLogo}>
        {item.logo.startsWith('http') ? (
          <Image
            source={{ uri: item.logo }}
            style={styles.communityLogoImage}
          />
        ) : (
          <Text style={styles.communityLogoText}>{item.logo}</Text>
        )}
      </View>
      <View style={styles.communityInfo}>
        <View style={styles.communityHeader}>
          <Text style={styles.communityName}>{item.name}</Text>
          {item.isFollowing && (
            <View style={styles.followingBadge}>
              <MaterialIcons name="check-circle" size={16} color="#9a0f21" />
              <Text style={styles.followingText}>Following</Text>
            </View>
          )}
        </View>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.memberCount}>
          {item.memberCount} members
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, !showBackButton && styles.headerTitleCentered]}>
          Communities
        </Text>
        {showBackButton && <View style={styles.headerSpacer} />}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Community"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Communities List */}
        <SectionList
          sections={filteredAndGroupedCommunities}
          renderItem={renderCommunityItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />

        {/* Alphabetical Index */}
        <View style={styles.alphabetIndex}>
          {alphabetIndex.map(letter => (
            <TouchableOpacity
              key={letter}
              style={[
                styles.alphabetIndexItem,
                selectedLetter === letter && styles.selectedAlphabetItem,
              ]}
              onPress={() => scrollToSection(letter)}
            >
              <Text
                style={[
                  styles.alphabetIndexText,
                  selectedLetter === letter && styles.selectedAlphabetText,
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleCentered: {
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9a0f21',
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  communityLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  communityLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  communityLogoText: {
    fontSize: 24,
  },
  communityInfo: {
    flex: 1,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingText: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '500',
    marginLeft: 4,
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  alphabetIndex: {
    width: 30,
    paddingVertical: 8,
    paddingRight: 8,
    justifyContent: 'center',
  },
  alphabetIndexItem: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  selectedAlphabetItem: {
    backgroundColor: '#9a0f21',
    borderRadius: 10,
    width: 20,
    height: 20,
  },
  alphabetIndexText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedAlphabetText: {
    color: '#fff',
  },
});

export default CommunitiesList; 
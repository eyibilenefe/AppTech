import CommunitiesList from '@/components/community/CommunitiesList';
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Database Types
interface DatabaseCommunity {
  id: string;
  name: string;
  mail: string;
  description: string;
  logo: string; // storage path
}

interface Community {
  id: string;
  name: string;
  logo: string;
  description: string;
  memberCount: number;
  isFollowing: boolean;
}

const CommunitiesListScreen = () => {
  const router = useRouter();
  const { user } = useSupabase();

  // State for Supabase data
  const [communities, setCommunities] = useState<Community[]>([]);
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

  // Fetch all communities
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*')
        .order('name');

      if (communitiesError) {
        throw communitiesError;
      }

      // Fetch user memberships and member counts
      const userMemberships = await fetchUserMemberships();
      const communityIds = (communitiesData || []).map(c => c.id);
      const memberCounts = await fetchMemberCounts(communityIds);

      // Process communities data and get logo URLs
      const processedCommunities = await Promise.all(
        (communitiesData || []).map(async (community: DatabaseCommunity) => {
          const logoUrl = await getImageUrl(community.logo, 'community-assets');
          return {
            id: community.id,
            name: community.name,
            logo: community.logo || '🛖', // fallback emoji if no image
            description: community.description,
            memberCount: memberCounts[community.id] || 0,
            isFollowing: userMemberships.includes(community.id),
          };
        })
      );

      setCommunities(processedCommunities);
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      setError(error.message || 'Failed to fetch communities');
      Alert.alert('Error', 'Failed to load communities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCommunityPress = (community: Community) => {
    // Navigate to the community detail screen
    router.push(`/(app)/(protected)/community/${community.id}`);
  };

  const handleBack = () => {
    // Navigate back to the main community screen
    router.back();
  };

  const handleRetry = () => {
    fetchCommunities();
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
        <Text style={styles.errorText}>Failed to load communities</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <CommunitiesList 
      communities={communities}
      onCommunityPress={handleCommunityPress}
      onBack={handleBack}
      showBackButton={true}
    />
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
});

export default CommunitiesListScreen; 
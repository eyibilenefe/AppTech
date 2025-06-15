import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

type ProfileUser = {
  id: string;
  pp: string | null;
  name: string;
  email: string;
  dept: string;
  bio: string | null;
};

type Post = {
  id: string;
  context: string;
  post_date: string;
  like_count: number;
  dislike_count: number;
  is_anonymous: boolean;
  image?: string | null;
  users: {
    name: string;
    pp: string | null;
  } | null;
  user_comments: {
    count: number;
  }[];
  post_votes: {
    vote_type: number;
    user_id: string;
  }[];
};

type PostWithVote = Post & { currentUserVote: number | null };

const { width } = Dimensions.get('window');
// container H padding (8*2=16) + gaps between 3 items (8*2=16) = 32
const GRID_ITEM_SIZE = (width - 32) / 3;

const AttendeeProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId: string;
  }>();

  const { userId } = params;
  const { user: currentUser } = useSupabase();
  const insets = useSafeAreaInsets();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<PostWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, pp, email, dept, bio')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        setProfileUser(userData);

        // Fetch user's public posts
        const { data: postData, error: postError } = await supabase
          .from('user_posts')
          .select(
            '*, users:user_id(name, pp), user_comments(count), post_votes(vote_type, user_id)'
          )
          .eq('user_id', userId)
          .eq('is_anonymous', false)
          .order('post_date', { ascending: false });

        if (postError) throw postError;

        if (postData) {
          const processed: PostWithVote[] = postData.map((p: any) => ({
            ...p,
            currentUserVote:
              p.post_votes.find((v: { user_id: string }) => v.user_id === currentUser?.id)
                ?.vote_type || null,
          }));
          setPosts(processed);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser]);

  const handlePostPress = (_post: PostWithVote) => {
    Alert.alert(
      'Info',
      'Viewing post details is not supported from this screen.'
    );
  };

  const renderGridItem = ({ item }: { item: PostWithVote }) => (
    <TouchableOpacity onPress={() => handlePostPress(item)} style={styles.gridItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.gridImage} />
      ) : (
        <View style={styles.gridTextContainer}>
          <Text numberOfLines={4} style={styles.gridText}>
            {item.context}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: PostWithVote }) => (
    <TouchableOpacity onPress={() => handlePostPress(item)} style={styles.listItem}>
      {item.image && <Image source={{ uri: item.image }} style={styles.listImage} />}
      <Text style={styles.listText}>{item.context}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#9a0f21" />
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>User not found.</Text>
      </SafeAreaView>
    );
  }

  const isCurrentUserProfile = currentUser?.id === profileUser.id;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileUser.name}'s Profile</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: profileUser.pp || 'https://place-hold.it/300' }}
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>{profileUser.name}</Text>
              <Text style={styles.profileInfo}>
                {profileUser.dept} • {profileUser.email}
              </Text>
              {profileUser.bio && <Text style={styles.profileBio}>{profileUser.bio}</Text>}
              {isCurrentUserProfile && (
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => router.push('/home/profile')}>
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.postsHeader}>
              <Text style={styles.postsTitle}>Posts</Text>
              <View style={styles.layoutToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, layoutMode === 'grid' && styles.toggleButtonActive]}
                  onPress={() => setLayoutMode('grid')}>
                  <MaterialIcons
                    name="grid-on"
                    size={20}
                    color={layoutMode === 'grid' ? 'white' : '#666'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, layoutMode === 'list' && styles.toggleButtonActive]}
                  onPress={() => setLayoutMode('list')}>
                  <MaterialIcons
                    name="view-list"
                    size={24}
                    color={layoutMode === 'list' ? 'white' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        data={posts}
        renderItem={layoutMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={layoutMode === 'grid' ? 3 : 1}
        key={layoutMode} // Force re-render on layout change
        contentContainerStyle={styles.postListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileInfo: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  editProfileButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#9a0f21',
    borderRadius: 25,
  },
  editProfileButtonText: {
    color: '#9a0f21',
    fontWeight: '600',
    fontSize: 14,
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  layoutToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  toggleButton: {
    padding: 8,
    width: 45,
    alignItems: 'center',
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  postListContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 100,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridTextContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  gridText: {
    fontSize: 12,
    color: '#333',
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  listImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listText: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  },
});

export default AttendeeProfileScreen; 
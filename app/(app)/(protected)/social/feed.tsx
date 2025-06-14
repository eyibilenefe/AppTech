import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import PostList from '../../../../components/PostList';
import ZoomableImage from '../../../components/ZoomableImage';

const filterOptions = ['Trending', 'Most Recent', 'Most Liked', 'My Posts', 'With Media'];

// Type for a post, aligned with your database and UI needs
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

// Function to format timestamp (e.g., "2 hours ago")
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};

const PostItem = React.memo(
  ({
    post,
    onPostPress,
    onVote,
    onImagePress,
    onCommentPress,
  }: {
    post: PostWithVote;
    onPostPress: (post: PostWithVote) => void;
    onVote: (post: PostWithVote, voteType: 1 | -1) => void;
    onImagePress: (imageUri: string) => void;
    onCommentPress: (postId: string) => void;
  }) => {
    const navigation = useNavigation<any>();

    const handleProfilePress = () => {
      if (post.is_anonymous || !post.users) return;
      // We assume `post.users` has an `id` property from the query, despite the local type.
      const userId = (post.users as any).id;
      if (userId) {
        navigation.navigate('ProfileReview', { userId });
      }
    };

    return (
      <TouchableOpacity style={styles.postContainer} onPress={() => onPostPress(post)}>
        <View style={styles.redditLayout}>
          {/* Left side - Voting */}
          <View style={styles.leftVotingColumn}>
            <View style={styles.votingContainer}>
              <TouchableOpacity
                style={[styles.voteButton, post.currentUserVote === 1 && styles.upvoteActive]}
                onPress={() => onVote(post, 1)}>
                <MaterialIcons
                  name="keyboard-arrow-up"
                  size={20}
                  color={post.currentUserVote === 1 ? '#ffffff' : '#9ca3af'}
                />
              </TouchableOpacity>

              <Text
                style={[
                  styles.voteCount,
                  (post.like_count || 0) > (post.dislike_count || 0) && { color: '#9a0f21' },
                  (post.dislike_count || 0) > (post.like_count || 0) && { color: '#6366F1' },
                ]}>
                {(post.like_count || 0) - (post.dislike_count || 0)}
              </Text>

              <TouchableOpacity
                style={[styles.voteButton, post.currentUserVote === -1 && styles.downvoteActive]}
                onPress={() => onVote(post, -1)}>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color={post.currentUserVote === -1 ? '#ffffff' : '#9ca3af'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Right side - Content */}
          <View style={styles.rightContentColumn}>
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.userInfo}
                onPress={handleProfilePress}
                disabled={post.is_anonymous}>
                {!post.is_anonymous && (
                  <Image
                    source={{ uri: post.users?.pp || 'https://place-hold.it/300' }}
                    style={styles.avatar}
                  />
                )}
                <View>
                  <Text style={styles.username}>
                    {post.is_anonymous ? 'Anonymous' : post.users?.name || 'User'}
                  </Text>
                  <Text style={styles.timestamp}>• {formatTimestamp(post.post_date)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.postContent}>{post.context}</Text>

            {post.image && (
              <TouchableOpacity onPress={() => onImagePress(post.image!)}>
                <Image source={{ uri: post.image }} style={styles.postImage} />
              </TouchableOpacity>
            )}

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.commentButtonAction}
                onPress={() => onCommentPress(post.id)}>
                <MaterialIcons name="comment" size={16} color="#666" />
                <Text style={styles.actionCount}>
                  {post.user_comments?.[0]?.count || 0} comments
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SocialFeedScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSupabase();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);
  const [posts, setPosts] = useState<PostWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Image preview state
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>('');
  
  // FAB animation and scroll state
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(0);
  const lastScrollY = useRef(0);
  const fabVisible = useRef(true);

  const CACHE_KEY = 'cached_posts_v1';

  // Helper to compute hybrid score combining likes and freshness
  const computeScore = (post: PostWithVote) => {
    const likes = (post.like_count || 0) - (post.dislike_count || 0);
    const hoursSincePosted = (Date.now() - new Date(post.post_date).getTime()) / 36e5; // ms to hours
    const freshnessWeight = Math.max(0, 48 - hoursSincePosted); // posts within last 48h get bonus
    return likes + freshnessWeight;
  };

  // Debounce search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Unified fetch function used by both initial load and pull-to-refresh
  const fetchPosts = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        let query = supabase
          .from('user_posts')
          .select(
            '*, users:user_id(id, name, pp), user_comments(count), post_votes(vote_type, user_id)'
          );

        // Apply search filter (case-insensitive)
        if (debouncedSearchText) {
          query = query.ilike('context', `%${debouncedSearchText}%`);
        }

        // Apply content filters
        switch (activeFilter) {
          case 'Most Recent':
            query = query.order('post_date', { ascending: false });
            break;
          case 'Most Liked':
            // Note: For true "most liked" (likes - dislikes), an RPC function in Supabase is more efficient.
            // This is a simplified version ordering by raw like_count.
            query = query.order('like_count', { ascending: false });
            break;
          case 'My Posts':
            query = query.eq('user_id', user.id).order('post_date', { ascending: false });
            break;
          case 'With Media':
            query = query.not('image', 'is', null).order('post_date', { ascending: false });
            break;
          // 'Trending' case is handled by client-side sorting below
          default:
            break;
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const processed: PostWithVote[] = data.map((p: any) => ({
            ...p,
            currentUserVote:
              p.post_votes.find((v: { user_id: string }) => v.user_id === user.id)?.vote_type ||
              null,
          }));

          // For 'Trending', we apply the hybrid score sorting on the client
          if (activeFilter === 'Trending') {
            processed.sort((a, b) => computeScore(b) - computeScore(a));
          }

          setPosts(processed);

          // Cache top 10 posts only for the default "Trending" view without search
          if (activeFilter === 'Trending' && !debouncedSearchText) {
            try {
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(processed.slice(0, 10)));
            } catch (cacheErr) {
              console.warn('Unable to cache posts', cacheErr);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [user, debouncedSearchText, activeFilter]
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // Load cached posts first for better UX / offline support
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setPosts(JSON.parse(cached));
        }
      } catch (err) {
        console.warn('Unable to read cached posts', err);
      }
    };
    loadCache();
  }, []);

  // Fetch posts whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // Initialize FAB entrance animation
  useEffect(() => {
    // Entrance animation
    fabScale.setValue(0);
    fabOpacity.setValue(0);
    
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fabOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePostPress = useCallback(
    (post: any) => {
    navigation.navigate('PostDetail', { post });
    },
    [navigation]
  );

  const handleVote = useCallback(
    async (post: PostWithVote, voteType: 1 | -1) => {
      if (!user) return;

      const originalVote = post.currentUserVote;
      const originalLikeCount = post.like_count;
      const originalDislikeCount = post.dislike_count;

      // Optimistically update the UI using a functional update
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id === post.id) {
            let newLikeCount = p.like_count;
            let newDislikeCount = p.dislike_count;
            let newVote: number | null = voteType;

            if (p.currentUserVote === voteType) {
              // Undoing vote
              newVote = null;
              if (voteType === 1) newLikeCount--;
              else newDislikeCount--;
            } else if (p.currentUserVote) {
              // Switching vote
              if (voteType === 1) {
                // Switched to upvote
                newLikeCount++;
                newDislikeCount--;
              } else {
                // Switched to downvote
                newLikeCount--;
                newDislikeCount++;
              }
            } else {
              // New vote
              if (voteType === 1) newLikeCount++;
              else newDislikeCount++;
            }

            return {
              ...p,
              like_count: newLikeCount,
              dislike_count: newDislikeCount,
              currentUserVote: newVote,
            };
          }
          return p;
        })
      );

      // Update the database
      try {
        if (originalVote === voteType) {
          // Delete existing vote
          await supabase.from('post_votes').delete().match({ post_id: post.id, user_id: user.id });
        } else if (originalVote) {
          // Update existing vote
          await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .match({ post_id: post.id, user_id: user.id });
        } else {
          // Insert new vote
          await supabase
            .from('post_votes')
            .insert({ post_id: post.id, user_id: user.id, vote_type: voteType });
        }
      } catch (error) {
        console.error('Error updating vote:', error);
        // Revert optimistic update on failure
        setPosts((currentPosts) =>
          currentPosts.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                like_count: originalLikeCount,
                dislike_count: originalDislikeCount,
                currentUserVote: originalVote,
              };
            }
            return p;
          })
        );
        Alert.alert('Error', 'Could not cast your vote. Please try again.');
      }
    },
    [user]
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      navigation.navigate('WriteComment', { postId });
    },
    [navigation]
  );

  const handleImagePress = useCallback((imageUri: string) => {
    setPreviewImageUri(imageUri);
    setImagePreviewVisible(true);
  }, []);

  const handleCloseImagePreview = () => {
    setImagePreviewVisible(false);
    setPreviewImageUri('');
  };

  // Handle scroll to auto-hide/show FAB
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    
    // Only react to significant scroll changes to avoid jitter
    if (Math.abs(diff) > 5) {
      if (diff > 0 && currentScrollY > 50) {
        // Scrolling down - hide FAB
        if (fabVisible.current) {
          fabVisible.current = false;
          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } else if (diff < 0) {
        // Scrolling up - show FAB
        if (!fabVisible.current) {
          fabVisible.current = true;
          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    }
    
    lastScrollY.current = currentScrollY;
    scrollY.current = currentScrollY;
  };

  const renderPostItem = useCallback(
    ({ item }: { item: PostWithVote }) => (
      <PostItem
        post={item}
        onPostPress={handlePostPress}
        onVote={handleVote}
        onImagePress={handleImagePress}
        onCommentPress={handleCommentPress}
      />
    ),
    [handlePostPress, handleVote, handleImagePress, handleCommentPress]
  );

  const handleCreatePost = () => {
    // Haptic feedback on tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Tap animation
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('CreatePost');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts…"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#666"
        />
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
      </View>

              {/* Filter Toolbar */}
        <View style={styles.filterWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScrollView}>
            {filterOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterButton, 
                  activeFilter === option && styles.filterButtonActive,
                  index === 0 && styles.filterButtonFirst,
                  index === filterOptions.length - 1 && styles.filterButtonLast
                ]}
                onPress={() => setActiveFilter(option)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilter === option && styles.filterButtonTextActive,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      {/* Posts Feed */}
      {loading ? (
        <ActivityIndicator size="large" color="#9a0f21" style={{ flex: 1 }} />
      ) : (
        <PostList
          posts={posts}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onScroll={handleScroll}
          onPostPress={handlePostPress}
          onVote={(post, voteType) => {
            void handleVote(post, voteType);
          }}
          onImagePress={handleImagePress}
          onCommentPress={handleCommentPress}
        />
      )}

      {/* Enhanced Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            opacity: fabOpacity,
            transform: [{ scale: fabScale }],
            bottom: Math.max(120, insets.bottom + 20), // Dynamic bottom positioning
          },
          ]}>
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={handleCreatePost}
            activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>

        {/* Image Preview Modal */}
        <Modal
          visible={imagePreviewVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseImagePreview}>
          <ZoomableImage imageUri={previewImageUri} onClose={handleCloseImagePreview} insets={insets} />
        </Modal>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginLeft: 8,
  },
  filterWrapper: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 12,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonFirst: {
    marginLeft: 0,
  },
  filterButtonLast: {
    marginRight: 16,
  },
  filterButtonActive: {
    backgroundColor: '#9a0f21',
    borderColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  feedContainer: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  redditLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftVotingColumn: {
    alignItems: 'center',
    paddingRight: 12,
    paddingTop: 4,
    minWidth: 50,
  },
  rightContentColumn: {
    flex: 1,
    paddingLeft: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  bottomActions: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  commentButtonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  votingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  voteButton: {
    padding: 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
    marginVertical: 2,
  },
  upvoteActive: {
    backgroundColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  downvoteActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 4,
    minWidth: 24,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#9a0f21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth,
    height: screenHeight,
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  bottomInstructions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 15,
  },
  instructionDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9a0f21',
    marginRight: 10,
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'white',
    opacity: 0.9,
  },
});

export default SocialFeedScreen; 
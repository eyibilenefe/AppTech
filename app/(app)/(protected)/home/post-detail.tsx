import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ZoomableImage from '../../../components/ZoomableImage';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

// Type definitions based on the provided schema
type Comment = {
  id: string;
  comment_date: string;
  context: string;
  image: string | null;
  user_id: string;
  user_posts_id: string;
  parent_id: string | null;
  like_count: number;
  dislike_count: number;
  users: {
    name: string;
    pp: string | null;
  } | null;
  replies: CommentWithVote[];
  comment_votes: {
    vote_type: number;
    user_id: string;
  }[];
};

type Post = {
    id: string;
    user_id: string;
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
type CommentWithVote = Comment & { currentUserVote: number | null };

const PostDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const searchParams = useLocalSearchParams();
  const router = useRouter();
  
  // Handle both React Navigation (from social tab) and Expo Router (from other tabs) parameters
  let initialPost: PostWithVote;
  if (searchParams.postData) {
    // Coming from Expo Router (e.g., from profile tab)
    try {
      initialPost = JSON.parse(searchParams.postData as string);
    } catch (error) {
      console.error('Error parsing post data:', error);
      // Fallback to route params if available
      initialPost = route.params?.post;
    }
  } else {
    // Coming from React Navigation (within social tab)
    initialPost = route.params?.post;
  }
  
  // Early return if no post data
  if (!initialPost) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <View style={styles.headerActions} />
          </View>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#999" />
            <Text style={styles.errorText}>Post not found</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
  
  const { user: authUser } = useSupabase(); // Get current authenticated user
  const insets = useSafeAreaInsets();
  
  // State management
  const [post, setPost] = useState<PostWithVote>(initialPost);
  const [comments, setComments] = useState<CommentWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  // Image preview state
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>('');

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Function to format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m`;
    return `${Math.floor(seconds)}s`;
  };

  // Helper to calculate and format vote rate
  const formatVoteRate = (likeCount: number, dislikeCount: number) => {
    const totalVotes = likeCount + dislikeCount;
    if (totalVotes === 0) return '0%';
    
    const upvoteRate = Math.round((likeCount / totalVotes) * 100);
    const downvoteRate = Math.round((dislikeCount / totalVotes) * 100);
    
    if (upvoteRate >= downvoteRate) {
      return `${upvoteRate}% ↑`;
    } else {
      return `${downvoteRate}% ↓`;
    }
  };

  // Fetch and structure comments
  const fetchComments = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_comments')
        .select('*, users:user_id(id, name, pp), comment_votes(vote_type, user_id)')
        .eq('user_posts_id', post.id)
        .order('comment_date', { ascending: true });

      if (error) throw error;

      const processedComments = data.map((c): CommentWithVote => ({
        ...c,
        currentUserVote: c.comment_votes.find((v: {user_id: string}) => v.user_id === authUser.id)?.vote_type || null,
      }));

      // Structure comments into a nested tree
      const commentsById: { [id: string]: CommentWithVote } = {};
      const rootComments: CommentWithVote[] = [];

      processedComments.forEach(comment => {
        commentsById[comment.id] = { ...comment, replies: [] };
      });

      processedComments.forEach(comment => {
        if (comment.parent_id && commentsById[comment.parent_id]) {
          (commentsById[comment.parent_id].replies as CommentWithVote[]).push(commentsById[comment.id]);
        } else {
          rootComments.push(commentsById[comment.id]);
        }
      });
      
      setComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      Alert.alert('Error', 'Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  }, [post.id, authUser]);

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [fetchComments])
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleWriteComment = () => {
    // For home tab, we'll show an alert since WriteComment navigation is social-specific
    Alert.alert('Feature not available', 'Comment writing is available in the Social tab.');
  };

  const handleImagePress = (imageUri: string) => {
    setPreviewImageUri(imageUri);
    setImagePreviewVisible(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewVisible(false);
    setPreviewImageUri('');
  };

  const handlePostVote = async (voteType: 1 | -1) => {
    if (!authUser) return;

    // Optimistic UI Update
    const originalVote = post.currentUserVote;
    const originalLikeCount = post.like_count;
    const originalDislikeCount = post.dislike_count;

    let newLikeCount = originalLikeCount;
    let newDislikeCount = originalDislikeCount;
    let newVote = voteType;

    if (originalVote === voteType) { // Undo vote
      newVote = null as any;
      if (voteType === 1) newLikeCount--; else newDislikeCount--;
    } else if (originalVote) { // Switch vote
      if (voteType === 1) { newLikeCount++; newDislikeCount--; }
      else { newLikeCount--; newDislikeCount++; }
    } else { // New vote
      if (voteType === 1) newLikeCount++; else newDislikeCount++;
    }

    setPost(prev => ({ ...prev, like_count: newLikeCount, dislike_count: newDislikeCount, currentUserVote: newVote }));

    try {
      if (originalVote === voteType) {
        await supabase.from('post_votes').delete().match({ post_id: post.id, user_id: authUser.id });
      } else if (originalVote) {
        await supabase.from('post_votes').update({ vote_type: voteType }).match({ post_id: post.id, user_id: authUser.id });
      } else {
        await supabase.from('post_votes').insert({ post_id: post.id, user_id: authUser.id, vote_type: voteType });
      }
    } catch (error) {
      console.error('Error voting on post:', error);
      setPost(prev => ({...prev, like_count: originalLikeCount, dislike_count: originalDislikeCount, currentUserVote: originalVote }));
    }
  };

  const handleCommentVote = async (comment: CommentWithVote, voteType: 1 | -1) => {
    if (!authUser) return;

    const updateVoteInComments = (list: CommentWithVote[]): CommentWithVote[] => {
      return list.map(c => {
        if (c.id === comment.id) {
          const originalVote = c.currentUserVote;
          let newLikeCount = c.like_count;
          let newDislikeCount = c.dislike_count;
          let newVote = voteType;

          if (originalVote === voteType) { // Undo vote
            newVote = null as any;
            if (voteType === 1) newLikeCount--; else newDislikeCount--;
          } else if (originalVote) { // Switch vote
            if (voteType === 1) { newLikeCount++; newDislikeCount--; }
            else { newLikeCount--; newDislikeCount++; }
          } else { // New vote
            if (voteType === 1) newLikeCount++; else newDislikeCount++;
          }

          return { ...c, like_count: newLikeCount, dislike_count: newDislikeCount, currentUserVote: newVote };
        }
        
        // Also update nested replies
        if (c.replies.length > 0) {
          return { ...c, replies: updateVoteInComments(c.replies) };
        }
        
        return c;
      });
    };

    setComments(updateVoteInComments(comments));

    try {
      const originalVote = comment.currentUserVote;
      if (originalVote === voteType) {
        await supabase.from('comment_votes').delete().match({ comment_id: comment.id, user_id: authUser.id });
      } else if (originalVote) {
        await supabase.from('comment_votes').update({ vote_type: voteType }).match({ comment_id: comment.id, user_id: authUser.id });
      } else {
        await supabase.from('comment_votes').insert({ comment_id: comment.id, user_id: authUser.id, vote_type: voteType });
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      fetchComments(); // Refresh on error
    }
  };

  const handleReply = (commentId: string, username: string) => {
    Alert.alert('Feature not available', 'Reply functionality is available in the Social tab.');
  };

  const handleDeletePost = async () => {
    if (!authUser || !post || post.user_id !== authUser.id) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const { error } = await supabase
                .from('user_posts')
                .delete()
                .eq('id', post.id);

              if (error) throw error;

              Alert.alert('Success', 'Post deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (commentId: string) => {
    if (!authUser) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_comments')
                .delete()
                .eq('id', commentId);

              if (error) throw error;

              const removeComment = (comments: CommentWithVote[], id: string): CommentWithVote[] => {
                return comments.filter(comment => {
                  if (comment.id === id) {
                    return false;
                  }
                  if (comment.replies.length > 0) {
                    comment.replies = removeComment(comment.replies, id);
                  }
                  return true;
                });
              };

              setComments(prev => removeComment(prev, commentId));
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment.');
            }
          }
        }
      ]
    );
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderRightActions = (commentId: string, username: string) => (
    <View style={styles.rightSwipeContainer}>
      <TouchableOpacity style={styles.replyAction} onPress={() => handleReply(commentId, username)}>
        <MaterialIcons name="reply" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = (commentId: string, isOwn: boolean) => (
    <View style={styles.leftSwipeContainer}>
      {isOwn && (
        <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(commentId)}>
          <MaterialIcons name="delete" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderReplies = (replies: CommentWithVote[], parentId: string, level: number = 1) => {
    if (!expandedReplies[parentId] || replies.length === 0) return null;
    
    return replies.map(reply => (
      <CommentItem key={reply.id} comment={reply} level={level} />
    ));
  };

  const CommentItem = ({ comment, level = 0 }: { comment: CommentWithVote; level?: number }) => {
    const isOwn = comment.user_id === authUser?.id;

    const handleProfilePress = () => {
      // For home tab, we'll show an alert since ProfileReview navigation is social-specific
      Alert.alert('Feature not available', 'Profile viewing is available in the Social tab.');
    };

    return (
      <View style={[styles.commentWrapper, { marginLeft: 16 * level }]}>
        <Swipeable
          ref={ref => { swipeableRefs.current[comment.id] = ref; }}
          renderLeftActions={() => renderLeftActions(comment.id, isOwn)}
          renderRightActions={() => renderRightActions(comment.id, comment.users?.name || 'User')}
          overshootFriction={1}
          friction={2}
          leftThreshold={40}
          rightThreshold={40}
        >
          <View style={[styles.commentBubble, isOwn && styles.ownCommentBubble]}>
            <View style={styles.commentHeader}>
              <TouchableOpacity
                style={styles.userInfo}
                onPress={handleProfilePress}
                disabled={!comment.users}>
                <Image
                  source={{ uri: comment.users?.pp || 'https://via.placeholder.com/36' }}
                  style={styles.commentAvatar}
                />
                <View style={styles.userDetails}>
                  <Text style={[styles.commentUsername, isOwn && styles.ownUsername]}>
                    {comment.users?.name || 'User'}
                  </Text>
                  <Text style={styles.commentTimestamp}>
                    {formatTimestamp(comment.comment_date)}
                  </Text>
                </View>
              </TouchableOpacity>
              {isOwn && (
                <View style={styles.ownBadge}>
                  <Text style={styles.ownBadgeText}>You</Text>
                </View>
              )}
            </View>
            
            <Text style={[styles.commentText, isOwn && styles.ownCommentText]}>
              {comment.context}
            </Text>
            
            {comment.image && (
              <TouchableOpacity 
                onPress={() => handleImagePress(comment.image!)}
                style={styles.commentImageContainer}
              >
                <Image source={{ uri: comment.image }} style={styles.commentImage} />
              </TouchableOpacity>
            )}
            
            <View style={styles.commentActions}>
              <View style={styles.commentVotingContainer}>
                <TouchableOpacity 
                  style={[styles.commentVoteButton, comment.currentUserVote === 1 && styles.commentUpvoteActive]}
                  onPress={() => handleCommentVote(comment, 1)}
                >
                  <MaterialIcons 
                    name="keyboard-arrow-up" 
                    size={18} 
                    color={comment.currentUserVote === 1 ? '#ffffff' : '#9ca3af'} 
                  />
                </TouchableOpacity>
                <Text style={[
                  styles.commentVoteCount,
                  (comment.like_count || 0) > (comment.dislike_count || 0) && { color: '#FF4500' },
                  (comment.dislike_count || 0) > (comment.like_count || 0) && { color: '#6366F1' }
                ]}>
                  {(comment.like_count || 0) - (comment.dislike_count || 0)}
                </Text>
                <TouchableOpacity 
                  style={[styles.commentVoteButton, comment.currentUserVote === -1 && styles.commentDownvoteActive]}
                  onPress={() => handleCommentVote(comment, -1)}
                >
                  <MaterialIcons 
                    name="keyboard-arrow-down" 
                    size={18} 
                    color={comment.currentUserVote === -1 ? '#ffffff' : '#9ca3af'} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => handleReply(comment.id, comment.users?.name || 'User')}
                style={styles.actionButton}
              >
                <MaterialIcons name="reply" size={16} color="#666" />
                <Text style={styles.actionButtonText}>Reply</Text>
              </TouchableOpacity>
              
              {comment.replies.length > 0 && (
                <TouchableOpacity 
                  onPress={() => toggleReplies(comment.id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons 
                    name={expandedReplies[comment.id] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={16} 
                    color="#007AFF" 
                  />
                  <Text style={styles.repliesButtonText}>
                    {expandedReplies[comment.id] ? 'Hide' : comment.replies.length} 
                    {comment.replies.length === 1 ? ' Reply' : ' Replies'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Swipeable>
        {renderReplies(comment.replies, comment.id, level)}
      </View>
    );
  };

  const isOwnPost = !post.is_anonymous && post.user_id === authUser?.id;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerActions}>
            {isDeleting ? (
              <ActivityIndicator color="#333" style={styles.moreButton} />
            ) : isOwnPost ? (
              <TouchableOpacity onPress={handleDeletePost} style={styles.moreButton}>
                <MaterialIcons name="delete-outline" size={26} color="#333" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Post Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.postCard}>
            <TouchableOpacity
              style={styles.postHeader}
              disabled={post.is_anonymous}
              onPress={() => Alert.alert('Feature not available', 'Profile viewing is available in the Social tab.')}>
              {!post.is_anonymous && (
                <Image 
                  source={{ uri: post.users?.pp || 'https://place-hold.it/300' }} 
                  style={styles.avatar} 
                />
              )}
              <View>
                <Text style={styles.username}>{post.is_anonymous ? 'Anonymous' : post.users?.name || 'User'}</Text>
                <Text style={styles.timestamp}>{formatTimestamp(post.post_date)}</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.postContent}>{post.context}</Text>
            {post.image && (
              <TouchableOpacity onPress={() => handleImagePress(post.image!)}>
                <Image source={{ uri: post.image }} style={styles.postImage} />
              </TouchableOpacity>
            )}
            <View style={styles.actionBar}>
              <View style={styles.votingContainerWrapper}>
                <View style={styles.votingContainer}>
                  <TouchableOpacity 
                    style={[styles.voteButton, post.currentUserVote === 1 && styles.upvoteActive]}
                    onPress={() => handlePostVote(1)}
                  >
                    <MaterialIcons 
                      name="keyboard-arrow-up" 
                      size={24} 
                      color={post.currentUserVote === 1 ? '#ffffff' : '#9ca3af'} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.voteCountContainer}>
                    <Text style={[styles.voteCount, 
                      (post.like_count || 0) > (post.dislike_count || 0) && styles.positiveVote,
                      (post.dislike_count || 0) > (post.like_count || 0) && styles.negativeVote
                    ]}>
                      {(post.like_count || 0) - (post.dislike_count || 0)}
                    </Text>
                    <Text style={styles.postVoteRate}>
                      {formatVoteRate(post.like_count || 0, post.dislike_count || 0)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.voteButton, post.currentUserVote === -1 && styles.downvoteActive]}
                    onPress={() => handlePostVote(-1)}
                  >
                    <MaterialIcons 
                      name="keyboard-arrow-down" 
                      size={24} 
                      color={post.currentUserVote === -1 ? '#ffffff' : '#9ca3af'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.commentButton} onPress={handleWriteComment}>
                <MaterialIcons name="mode-comment" size={20} color="#666" />
                <Text style={styles.commentCount}>{post.user_comments?.[0]?.count || comments.length || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#9a0f21" style={{ marginVertical: 20 }} />
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </ScrollView>

        {/* Write Comment Button */}
        <View style={styles.writeCommentContainer}>
          <TouchableOpacity style={styles.writeCommentButton} onPress={handleWriteComment}>
            <Text style={styles.writeCommentText}>Write a comment...</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview Modal */}
        <Modal
          visible={imagePreviewVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseImagePreview}
        >
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity 
              style={styles.imagePreviewClose}
              onPress={handleCloseImagePreview}
            >
              <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <ZoomableImage 
              imageUri={previewImageUri}
              onClose={handleCloseImagePreview}
              insets={insets}
            />
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  moreButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  
  // Post card design
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c2c2c',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  
  // Enhanced action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  votingContainerWrapper: {
    flex: 1,
    alignItems: 'flex-start',
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  voteButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  upvoteActive: {
    backgroundColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  downvoteActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  voteCountContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 40,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  positiveVote: {
    color: '#9a0f21',
  },
  negativeVote: {
    color: '#6366F1',
  },
  postVoteRate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    paddingHorizontal: 2,
  },
  
  // Comment button
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  commentCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  commentsSection: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  
  // Modern comment bubble design
  commentWrapper: {
    marginBottom: 16,
  },
  commentBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ownCommentBubble: {
    backgroundColor: '#f8f9ff',
    borderColor: '#e8f0ff',
  },
  
  // User info section
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  userDetails: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  ownUsername: {
    color: '#007AFF',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  ownBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ownBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Comment content
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  ownCommentText: {
    color: '#2c2c2c',
  },
  commentImageContainer: {
    marginBottom: 12,
  },
  commentImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  
  // Action buttons
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  commentVotingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  commentVoteButton: {
    padding: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
    minHeight: 28,
    marginHorizontal: 1,
  },
  commentUpvoteActive: {
    backgroundColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  commentDownvoteActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  commentVoteCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 6,
    minWidth: 20,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#f8f8f8',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  repliesButtonText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  writeCommentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  writeCommentButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 20,
    alignItems: 'flex-start',
  },
  writeCommentText: {
    color: '#666',
  },
  // Swipeable container styles
  swipeableContainer: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  swipeableContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Swipe action containers
  rightSwipeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    backgroundColor: '#007AFF',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginVertical: 2,
  },
  leftSwipeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    backgroundColor: '#FF3B30',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginVertical: 2,
  },
  replyAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  
  // Image preview
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  imagePreviewContent: {
    width: '90%',
    height: '70%',
  },
});

export default PostDetailScreen; 
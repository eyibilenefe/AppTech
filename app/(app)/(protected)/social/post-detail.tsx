import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// Enhanced dummy comments data with nested structure
const dummyCommentsData = [
  {
    id: '1',
    username: 'alice_wonder',
    avatar: 'https://via.placeholder.com/32',
    content: 'Great post! Thanks for sharing this.',
    timestamp: '1 hour ago',
    isAnonymous: false,
    isOwn: false,
    replies: [
      {
        id: '1-1',
        username: 'bob_builder',
        avatar: 'https://via.placeholder.com/32',
        content: 'I completely agree with Alice here!',
        timestamp: '50 minutes ago',
        isAnonymous: false,
        isOwn: false,
        replies: [
          {
            id: '1-1-1',
            username: 'charlie_dev',
            avatar: 'https://via.placeholder.com/32',
            content: 'Same thoughts! Great discussion.',
            timestamp: '45 minutes ago',
            isAnonymous: false,
            isOwn: true,
            replies: [],
          }
        ],
      },
      {
        id: '1-2',
        username: 'Anonymous',
        avatar: 'https://via.placeholder.com/32',
        content: 'This helped me understand the topic better.',
        timestamp: '40 minutes ago',
        isAnonymous: true,
        isOwn: false,
        replies: [],
      },
    ],
  },
  {
    id: '2',
    username: 'Anonymous',
    avatar: 'https://via.placeholder.com/32',
    content: 'I totally agree with this sentiment.',
    timestamp: '45 minutes ago',
    isAnonymous: true,
    isOwn: false,
    replies: [],
  },
  {
    id: '3',
    username: 'bob_builder',
    avatar: 'https://via.placeholder.com/32',
    content: 'This is exactly what I needed to hear today! 🙌',
    timestamp: '30 minutes ago',
    isAnonymous: false,
    isOwn: true,
    replies: [
      {
        id: '3-1',
        username: 'diana_designer',
        avatar: 'https://via.placeholder.com/32',
        content: 'So motivational! Thanks for sharing your thoughts.',
        timestamp: '25 minutes ago',
        isAnonymous: false,
        isOwn: false,
        replies: [],
      },
      {
        id: '3-2',
        username: 'eve_explorer',
        avatar: 'https://via.placeholder.com/32',
        content: 'Love this energy! Keep it up!',
        timestamp: '20 minutes ago',
        isAnonymous: false,
        isOwn: false,
        replies: [],
      },
      {
        id: '3-3',
        username: 'frank_photographer',
        avatar: 'https://via.placeholder.com/32',
        content: 'Absolutely inspiring! This made my day.',
        timestamp: '18 minutes ago',
        isAnonymous: false,
        isOwn: false,
        replies: [],
      },
    ],
  },
  {
    id: '4',
    username: 'Anonymous',
    avatar: 'https://via.placeholder.com/32',
    content: 'Does anyone have more recommendations similar to this?',
    timestamp: '15 minutes ago',
    isAnonymous: true,
    isOwn: false,
    replies: [
      {
        id: '4-1',
        username: 'grace_guru',
        avatar: 'https://via.placeholder.com/32',
        content: 'Check out these resources: link1, link2, link3',
        timestamp: '10 minutes ago',
        isAnonymous: false,
        isOwn: false,
        replies: [],
      },
    ],
  },
  {
    id: '5',
    username: 'henry_helper',
    avatar: 'https://via.placeholder.com/32',
    content: 'Thanks for the detailed explanation! Very helpful.',
    timestamp: '12 minutes ago',
    isAnonymous: false,
    isOwn: false,
    replies: [],
  },
  {
    id: '6',
    username: 'ivy_innovator',
    avatar: 'https://via.placeholder.com/32',
    content: 'This perspective is really eye-opening. Never thought about it this way.',
    timestamp: '8 minutes ago',
    isAnonymous: false,
    isOwn: false,
    replies: [],
  },
  {
    id: '7',
    username: 'jack_journalist',
    avatar: 'https://via.placeholder.com/32',
    content: 'Great insights! Would love to see more content like this.',
    timestamp: '5 minutes ago',
    isAnonymous: false,
    isOwn: false,
    replies: [],
  },
];

const COMMENTS_PER_PAGE = 5;
const MAX_VISIBLE_REPLIES = 2;

const PostDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { post } = route.params;
  
  // State management
  const [comments, setComments] = useState(dummyCommentsData.slice(0, COMMENTS_PER_PAGE));
  const [allComments] = useState(dummyCommentsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});
  const [deletedComments, setDeletedComments] = useState<Set<string>>(new Set());

  const swipeableRefs = useRef<{ [key: string]: Swipeable }>({});

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleWriteComment = () => {
    navigation.navigate('WriteComment', { postId: post.id });
  };

  const handleReply = (commentId: string, username: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('WriteComment', { 
      postId: post.id, 
      replyTo: commentId,
      replyToUsername: username 
    });
    // Close the swipeable after action
    if (swipeableRefs.current[commentId]) {
      swipeableRefs.current[commentId].close();
    }
  };

  const handleDelete = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletedComments(prev => new Set([...prev, commentId]));
            if (swipeableRefs.current[commentId]) {
              swipeableRefs.current[commentId].close();
            }
          },
        },
      ]
    );
  };

  const toggleReplies = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const loadMoreComments = async () => {
    if (loading) return;
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate network delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * COMMENTS_PER_PAGE;
      const newComments = allComments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
      
      if (newComments.length > 0) {
        setComments(prev => [...prev, ...newComments]);
        setCurrentPage(nextPage);
      }
      
      setLoading(false);
    }, 1000);
  };

  const renderRightActions = (commentId: string, username: string) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.replyAction]}
          onPress={() => handleReply(commentId, username)}
        >
          <Text style={styles.swipeActionIcon}>📝</Text>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (commentId: string, isOwn: boolean) => {
    if (!isOwn) return null;
    
    return (
      <View style={styles.leftActions}>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.deleteAction]}
          onPress={() => handleDelete(commentId)}
        >
          <Text style={styles.swipeActionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReplies = (replies: any[], parentId: string, level: number = 1) => {
    if (replies.length === 0) return null;
    
    const isExpanded = expandedReplies[parentId];
    const visibleReplies = isExpanded ? replies : replies.slice(0, MAX_VISIBLE_REPLIES);
    const hiddenCount = replies.length - MAX_VISIBLE_REPLIES;

    return (
      <View style={[styles.repliesContainer, { marginLeft: Math.min(level * 20, 40) }]}>
        {visibleReplies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            level={level}
            onToggleReplies={() => toggleReplies(reply.id)}
          />
        ))}
        
        {!isExpanded && hiddenCount > 0 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => toggleReplies(parentId)}
          >
            <Text style={styles.showMoreText}>
              ▼ Show More Replies ({hiddenCount} more)
            </Text>
          </TouchableOpacity>
        )}
        
        {isExpanded && replies.length > MAX_VISIBLE_REPLIES && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => toggleReplies(parentId)}
          >
            <Text style={styles.showMoreText}>▲ Hide Replies</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const CommentItem = ({ comment, level = 0, onToggleReplies }: { 
    comment: any; 
    level?: number; 
    onToggleReplies?: () => void;
  }) => {
    if (deletedComments.has(comment.id)) {
      return (
        <View style={[styles.commentContainer, styles.deletedComment]}>
          <Text style={styles.deletedText}>Comment deleted</Text>
        </View>
      );
    }

    return (
      <View>
        <Swipeable
          ref={(ref) => {
            if (ref) swipeableRefs.current[comment.id] = ref;
          }}
          renderRightActions={() => renderRightActions(comment.id, comment.username)}
          renderLeftActions={() => renderLeftActions(comment.id, comment.isOwn)}
          rightThreshold={40}
          leftThreshold={40}
        >
          <View style={[
            styles.commentContainer,
            level > 0 && styles.nestedComment,
          ]}>
            <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUsername}>{comment.username}</Text>
                <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
              
              {/* Reply button for non-swipe interaction */}
              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => handleReply(comment.id, comment.username)}
              >
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Swipeable>
        
        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <>
            {renderReplies(comment.replies, comment.id, level + 1)}
          </>
        )}
      </View>
    );
  };

  const hasMoreComments = comments.length < allComments.length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Detail */}
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} />
                <Text style={styles.username}>{post.username}</Text>
              </View>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
            
            <Text style={styles.postContent}>{post.content}</Text>
            
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}
            
            <View style={styles.actionBar}>
              <View style={styles.actionStats}>
                <Text style={styles.statText}>{post.likes} likes</Text>
                <Text style={styles.statText}>{post.comments} comments</Text>
                <Text style={styles.statText}>{post.shares} shares</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.postActionButton}>
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={styles.actionLabel}>Like</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.postActionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionLabel}>Comment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.postActionButton}>
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({allComments.length})
              <Text style={styles.swipeHint}> • Swipe to reply or delete</Text>
            </Text>
            
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            
            {/* Load More Comments Button */}
            {hasMoreComments && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreComments}
                disabled={loading}
              >
                <Text style={styles.loadMoreText}>
                  {loading ? 'Loading...' : `Load More Comments (${allComments.length - comments.length} more)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Comment Input Bar */}
        <TouchableOpacity style={styles.commentInputBar} onPress={handleWriteComment}>
          <View style={styles.commentInputContainer}>
            <Text style={styles.commentInputPlaceholder}>Write a comment...</Text>
            <MaterialIcons name="send" size={20} color="#666" />
          </View>
        </TouchableOpacity>
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
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionBar: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 12,
  },
  actionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  actionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: 'white',
    paddingTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  nestedComment: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 2,
    borderLeftColor: '#e9ecef',
  },
  deletedComment: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  deletedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '500',
  },
  repliesContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  showMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  showMoreText: {
    fontSize: 13,
    color: '#9a0f21',
    fontWeight: '500',
  },
  rightActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#9a0f21',
  },
  leftActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FF3B30',
  },
  swipeActionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: '100%',
  },
  replyAction: {
    backgroundColor: '#9a0f21',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  swipeActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#9a0f21',
    fontWeight: '500',
  },
  commentInputBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  commentInputPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
});

export default PostDetailScreen; 
import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Keep a local copy of the core Post type to avoid deep import chains
export type Post = {
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

export type PostWithVote = Post & { currentUserVote: number | null };

// Local helper to format time differences
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

export type PostCardProps = {
  post: PostWithVote;
  onPostPress: (post: PostWithVote) => void;
  onVote: (post: PostWithVote, voteType: 1 | -1) => void;
  onImagePress: (imageUri: string) => void;
  onCommentPress: (postId: string) => void;
};

function _PostCard({
  post,
  onPostPress,
  onVote,
  onImagePress,
  onCommentPress,
}: PostCardProps) {
  return (
    <TouchableOpacity style={styles.postContainer} onPress={() => onPostPress(post)}>
      <View style={styles.redditLayout}>
        {/* Left Voting Column */}
        <View style={styles.leftVotingColumn}>
          <View style={styles.votingContainer}>
            <TouchableOpacity
              style={[styles.voteButton, post.currentUserVote === 1 && styles.upvoteActive]}
              onPress={() => onVote(post, 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
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
              ]}
            >
              {(post.like_count || 0) - (post.dislike_count || 0)}
            </Text>

            <TouchableOpacity
              style={[styles.voteButton, post.currentUserVote === -1 && styles.downvoteActive]}
              onPress={() => onVote(post, -1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={post.currentUserVote === -1 ? '#ffffff' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
          
          {/* Vote Rate Display */}
          <Text style={styles.voteRate}>
            {formatVoteRate(post.like_count || 0, post.dislike_count || 0)}
          </Text>
        </View>

        {/* Right Content Column */}
        <View style={styles.rightContentColumn}>
          {/* Header */}
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              {!post.is_anonymous && (
                <Image
                  source={{ uri: post.users?.pp || 'https://place-hold.it/300' }}
                  style={styles.avatar}
                />
              )}
              <Text style={styles.username}>
                {post.is_anonymous ? 'Anonymous' : post.users?.name || 'User'}
              </Text>
              <Text style={styles.timestamp}>• {formatTimestamp(post.post_date)}</Text>
            </View>
          </View>

          {/* Body */}
          <Text style={styles.postContent}>{post.context}</Text>
          {!!post.image && (
            <TouchableOpacity onPress={() => onImagePress(post.image!)}>
              <Image source={{ uri: post.image }} style={styles.postImage} />
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.commentButtonAction}
              onPress={() => onCommentPress(post.id)}
            >
              <MaterialIcons name="comment" size={16} color="#666" />
              <Text style={styles.actionCount}>{post.user_comments?.[0]?.count || 0} comments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const PostCard = memo(_PostCard) as typeof _PostCard;
export default PostCard;

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
    paddingRight: 8,
    paddingTop: 4,
    minWidth: 40,
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
    marginRight: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
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
  commentButtonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  voteButton: {
    padding: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
    marginVertical: 1,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 2,
    minWidth: 20,
    textAlign: 'center',
  },
  voteRate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 0,
  },
}); 
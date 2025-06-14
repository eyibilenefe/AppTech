import React from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl } from 'react-native';
import PostCard, { PostWithVote } from './PostCard';

type PostListProps = {
  posts: PostWithVote[];
  refreshing: boolean;
  onRefresh: () => void;
  onScroll: (e: any) => void;
  onPostPress: (post: PostWithVote) => void;
  onVote: (post: PostWithVote, voteType: 1 | -1) => void;
  onImagePress: (imageUri: string) => void;
  onCommentPress: (postId: string) => void;
};

const PostList: React.FC<PostListProps> = ({
  posts,
  refreshing,
  onRefresh,
  onScroll,
  onPostPress,
  onVote,
  onImagePress,
  onCommentPress,
}) => {
  const renderItem = ({ item }: ListRenderItemInfo<PostWithVote>) => (
    <PostCard
      post={item}
      onPostPress={onPostPress}
      onVote={onVote}
      onImagePress={onImagePress}
      onCommentPress={onCommentPress}
    />
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

export default PostList; 
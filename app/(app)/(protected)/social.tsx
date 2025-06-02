import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CreatePostScreen from './social/create-post';
import SocialFeedScreen from './social/feed';
import PostDetailScreen from './social/post-detail';
import WriteCommentScreen from './social/write-comment';

const Stack = createStackNavigator();

const Social = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Feed" component={SocialFeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="WriteComment" component={WriteCommentScreen} />
    </Stack.Navigator>
  );
};

export default Social;
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

// Types based on Supabase schema
interface UserPost {
  id: string;
  user_id: string;
  context: string;
  media_urls: string[] | null;
  post_date: string;
  likes: number;
  is_anonymous: boolean;
}

interface UserComment {
  id: string;
  comment_date: string;
  context: string;
  image: string | null;
  user_id: string;
  user_posts_id: string;
  parent_id: string | null;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'comment';
  content: string;
  date: string;
  postId?: string; // For comments, to show which post it's on
}

const ProfileScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { user, profile, updateProfile } = useSupabase();
  
  // State for profile picture upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // State for biography editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  
  // State for user activity
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  
  // State for stats
  const [stats, setStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  });

  const handleBackPress = () => {
    router.back();
  };

  // Function to upload image to Supabase Storage
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      if (!user) return null;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      const fileName = `${user.id}.jpg`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Function to handle profile picture selection and upload
  const handleProfilePicturePress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload profile pictures!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        const imageUrl = await uploadImage(result.assets[0].uri);
        
        if (imageUrl && user) {
          try {
            // Update the profile using the context function
            await updateProfile({ pp: imageUrl });
            Alert.alert('Success', 'Profile picture updated successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to update profile picture');
            console.error('Error updating profile picture:', error);
          }
        } else {
          Alert.alert('Error', 'Failed to upload image');
        }
        
        setIsUploadingImage(false);
      }
    } catch (error) {
      console.error('Error handling profile picture:', error);
      setIsUploadingImage(false);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  // Function to update biography
  const handleUpdateBio = async () => {
    if (!user) return;
    
    setIsUpdatingBio(true);
    
    try {
      // Update the profile using the context function
      await updateProfile({ bio: bioText });
      setIsEditingBio(false);
      Alert.alert('Success', 'Biography updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update biography');
    }
    
    setIsUpdatingBio(false);
  };

  // Function to fetch user activity (posts and comments)
  const fetchUserActivity = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingActivity(true);
    
    try {
      // Fetch user posts (excluding anonymous ones)
      const { data: posts, error: postsError } = await supabase
        .from('user_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('post_date', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      }

      // Fetch user comments
      const { data: comments, error: commentsError } = await supabase
        .from('user_comments')
        .select('*')
        .eq('user_id', user.id)
        .order('comment_date', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      // Combine posts and comments into activity items
      const activity: ActivityItem[] = [];

      // Add posts to activity
      posts?.forEach((post: UserPost) => {
        activity.push({
          id: `post-${post.id}`,
          type: 'post',
          content: post.context,
          date: post.post_date,
        });
      });

      // Add comments to activity
      comments?.forEach((comment: UserComment) => {
        activity.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          content: comment.context,
          date: comment.comment_date,
          postId: comment.user_posts_id,
        });
      });

      // Sort by date (most recent first)
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setUserActivity(activity);

      // Calculate stats
      const totalLikes = posts?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;
      setStats({
        postsCount: posts?.length || 0,
        commentsCount: comments?.length || 0,
        likesReceived: totalLikes,
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
    
    setIsLoadingActivity(false);
  }, [user]);

  // Fetch user activity on component mount
  useEffect(() => {
    fetchUserActivity();
  }, [fetchUserActivity]);

  // Update bioText when profile changes
  useEffect(() => {
    if (profile?.bio !== undefined) {
      setBioText(profile.bio || '');
    }
  }, [profile?.bio]);

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Function to handle activity item press and navigate to post details
  const handleActivityPress = async (activity: ActivityItem) => {
    try {
      let postId: string;
      
      // Determine which post to navigate to
      if (activity.type === 'post') {
        // For posts, use the post ID from the activity ID
        postId = activity.id.replace('post-', '');
      } else {
        // For comments, use the postId field
        postId = activity.postId || '';
      }

      if (!postId) {
        console.error('No post ID found for activity:', activity);
        return;
      }

      // Fetch the full post data to pass to PostDetail screen
      const { data: postData, error } = await supabase
        .from('user_posts')
        .select('*, users:user_id(id, name, pp), user_comments(count), post_votes(vote_type, user_id)')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post for navigation:', error);
        Alert.alert('Error', 'Could not load the post. It may have been deleted.');
        return;
      }

      if (!postData) {
        Alert.alert('Error', 'Post not found. It may have been deleted.');
        return;
      }

      // Transform the data to match the expected format
      let postWithVote = {
        ...postData,
        currentUserVote: postData.post_votes?.find((v: any) => v.user_id === user?.id)?.vote_type || null,
      };

      // Navigate to the new PostDetail screen in home folder
      router.push({
        pathname: '/(app)/(protected)/home/post-detail',
        params: { postData: JSON.stringify(postWithVote) }
      });
      
    } catch (error) {
      console.error('Error navigating to post:', error);
      Alert.alert('Error', 'Could not load the post.');
    }
  };

  const renderActivity = (activity: ActivityItem) => (
    <TouchableOpacity 
      key={activity.id} 
      style={styles.activityItem}
      onPress={() => handleActivityPress(activity)}
      activeOpacity={0.7}
    >
      <View style={styles.activityIcon}>
        <MaterialIcons 
          name={activity.type === 'post' ? 'article' : 'comment'} 
          size={20} 
          color="#9a0f21" 
        />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityType}>
            {activity.type === 'post' ? '📢 Post' : '💬 Comment'}
            {activity.type === 'comment' && activity.postId && (
              <Text style={styles.activityPostRef}> on post #{activity.postId.slice(-6)}</Text>
            )}
          </Text>
          <Text style={styles.activityTime}>{formatDate(activity.date)}</Text>
        </View>
        <Text style={styles.activityText} numberOfLines={3}>
          {activity.content}
        </Text>
        <View style={styles.activityFooter}>
          <MaterialIcons name="launch" size={14} color="#9a0f21" />
          <Text style={styles.tapToViewText}>Tap to view</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text></Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section - No Cover Image */}
        <View style={styles.profileContainer}>
          {/* Avatar */}
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleProfilePicturePress}
            disabled={isUploadingImage}
          >
            <View style={styles.avatar}>
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="#9a0f21" />
              ) : profile.pp ? (
                <Image source={{ uri: profile.pp }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={48} color="#9a0f21" />
              )}
            </View>
            <View style={styles.avatarEditIcon}>
              <MaterialIcons name="camera-alt" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userTitle}>{profile.dept}</Text>
          
          {/* Biography Section */}
          <View style={styles.bioContainer}>
            <View style={styles.bioHeader}>
              <Text style={styles.bioLabel}>Biography</Text>
              <TouchableOpacity onPress={() => setIsEditingBio(true)}>
                <MaterialIcons name="edit" size={16} color="#9a0f21" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bioText}>
              {profile?.bio || 'No biography added yet. Tap edit to add one!'}
            </Text>
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="badge" size={16} color="#666" />
              <Text style={styles.detailText}>Student No: {profile.st_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={16} color="#666" />
              <Text style={styles.detailText}>{profile.email}</Text>
            </View>
            {profile.tel_no && (
              <View style={styles.detailRow}>
                <MaterialIcons name="phone" size={16} color="#666" />
                <Text style={styles.detailText}>{profile.tel_no}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="article" size={24} color="#9a0f21" />
            <Text style={styles.statNumber}>{stats.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="comment" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.commentsCount}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="favorite" size={24} color="#FF6B35" />
            <Text style={styles.statNumber}>{stats.likesReceived}</Text>
            <Text style={styles.statLabel}>Likes Received</Text>
          </View>
        </View>

        {/* User Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Activity</Text>
            <TouchableOpacity onPress={fetchUserActivity}>
              <MaterialIcons name="refresh" size={20} color="#9a0f21" />
            </TouchableOpacity>
          </View>
          
          {isLoadingActivity ? (
            <View style={styles.activityLoading}>
              <ActivityIndicator size="small" color="#9a0f21" />
              <Text style={styles.loadingText}>Loading activity...</Text>
            </View>
          ) : userActivity.length > 0 ? (
            <View style={styles.activityList}>
              {userActivity.slice(0, 10).map(renderActivity)}
              {userActivity.length > 10 && (
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>Show More ({userActivity.length - 10} more)</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noActivityContainer}>
              <MaterialIcons name="inbox" size={48} color="#ccc" />
              <Text style={styles.noActivityText}>No activity yet</Text>
              <Text style={styles.noActivitySubtext}>Start posting and commenting to see your activity here!</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="bolt" size={20} color="#9a0f21" />
            <Text style={styles.actionButtonText}>Chat History</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Biography Edit Modal */}
      <Modal
        visible={isEditingBio}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditingBio(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Biography</Text>
              <TouchableOpacity onPress={() => setIsEditingBio(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.bioInput}
              value={bioText}
              onChangeText={setBioText}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            
            <Text style={styles.charCounter}>{bioText.length}/200</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setBioText(profile?.bio || '');
                  setIsEditingBio(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateBio}
                disabled={isUpdatingBio}
              >
                {isUpdatingBio ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9a0f21',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 16,
    color: '#9a0f21',
    marginBottom: 16,
    textAlign: 'center',
  },
  bioContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityPostRef: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '400',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  tapToViewText: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '400',
  },
  showMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  showMoreText: {
    fontSize: 14,
    color: '#9a0f21',
    fontWeight: '600',
  },
  noActivityContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  noActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#9a0f21',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileScreen;

import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toByteArray } from 'base64-js';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

const WriteCommentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId, replyTo, replyToUsername } = route.params;
  const { user, profile } = useSupabase();

  const [commentText, setCommentText] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCancel = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user || !profile) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    setIsUploading(true);
    let imageUrl: string | null = null;

    try {
      if (image?.base64) {
        const fileExt = image.uri.split('.').pop() || 'jpg';
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `comment-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, toByteArray(image.base64), {
            contentType: `image/${fileExt}`,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('user_comments').insert({
        context: commentText,
        image: imageUrl,
        user_id: profile.id,
        user_posts_id: postId,
        parent_id: replyTo || null,
        comment_date: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Your comment has been posted!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', error.message || 'Failed to post comment.');
    } finally {
      setIsUploading(false);
    }
  };

  const MediaUploadBox = ({ icon, label }: { icon: string; label: string }) => (
    <TouchableOpacity style={styles.mediaBox}>
      <Text style={styles.mediaIcon}>{icon}</Text>
      <Text style={styles.mediaLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Comment</Text>
        <TouchableOpacity 
          onPress={handleComment} 
          style={[styles.headerButton, styles.commentButton]}
          disabled={!commentText.trim() || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={[
              styles.commentButtonText, 
              (!commentText.trim() || isUploading) && styles.commentButtonTextDisabled
            ]}>
              Reply
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Replying To Section */}
        <View style={styles.replyingToSection}>
          <Text style={styles.replyingToText}>
            {replyToUsername 
              ? `Replying to @${replyToUsername}` 
              : `Replying to post`
            }
          </Text>
          <MaterialIcons name="reply" size={16} color="#666" style={styles.replyIcon} />
        </View>

        {/* User Info Section */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: profile?.pp || 'https://via.placeholder.com/48' }} 
            style={styles.userAvatar} 
          />
          <Text style={styles.usernameText}>{profile?.name}</Text>
        </View>

        {/* Comment Text Input */}
        <View style={styles.textInputSection}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Write your comment..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={commentText}
            onChangeText={setCommentText}
            textAlignVertical="top"
          />
        </View>

        {/* Media Upload Section */}
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Add Media (Optional)</Text>
          <View style={styles.mediaGrid}>
            <TouchableOpacity style={styles.mediaBox} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              ) : (
                <>
                  <Text style={styles.mediaIcon}>📷</Text>
                  <Text style={styles.mediaLabel}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.sendButton, (!commentText.trim() || isUploading) && styles.sendButtonDisabled]}
          onPress={handleComment}
          disabled={!commentText.trim() || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#9a0f21" size="small" />
          ) : (
            <>
              <MaterialIcons 
                name="send" 
                size={24} 
                color={(commentText.trim() && !isUploading) ? 'white' : '#ccc'} 
              />
              <Text style={[
                styles.sendButtonText, 
                (!commentText.trim() || isUploading) && styles.sendButtonTextDisabled
              ]}>
                Send Reply
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  commentButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  commentButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  commentButtonTextDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  replyingToSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 14,
    color: '#9a0f21',
    fontStyle: 'italic',
    flex: 1,
  },
  replyIcon: {
    marginLeft: 8,
  },
  userSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  anonymousToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  textInputSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  commentTextInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagsSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tagInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  mediaSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaBox: {
    flex: 1,
    height: 100,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderStyle: 'dashed',
  },
  mediaIcon: {
    fontSize: 24,
  },
  mediaLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  bottomSection: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9a0f21',
    paddingVertical: 14,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sendButtonTextDisabled: {
    color: '#ccc',
  },
});

export default WriteCommentScreen; 
import { useNavigation } from '@react-navigation/native';
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const { user, profile } = useSupabase();

  const [postText, setPostText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
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

  const handlePost = async () => {
    if (!postText.trim() || !user) {
      Alert.alert('Error', 'Post content cannot be empty.');
      return;
    }

    setIsUploading(true);
    let imageUrl: string | null = null;

    try {
      if (image) {
        if (image?.base64) {
          const fileExt = image.uri.split('.').pop() || 'jpg';
          const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
          const filePath = `post-images/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, toByteArray(image.base64), {
              contentType: `image/${fileExt}`,
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          imageUrl = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('user_posts').insert({
        context: postText,
        image: imageUrl,
        user_id: isAnonymous ? null : profile?.id,
        is_anonymous: isAnonymous,
        post_date: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      Alert.alert('Success', 'Your post has been created!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
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
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          style={[styles.headerButton, styles.postButton]}
          disabled={!postText.trim() || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[
              styles.postText, 
              (!postText.trim() || isUploading) && styles.postTextDisabled
            ]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: isAnonymous ? 'https://place-hold.it/300' : profile?.pp || 'https://place-hold.it/300' }} 
            style={styles.userAvatar} 
          />
          <View style={styles.userInfo}>
            <View style={styles.anonymousToggle}>
              <Text style={styles.usernameText}>
                {isAnonymous ? 'Anonymous' : profile?.name || 'User'}
              </Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Anonymous</Text>
                <Switch
                  value={isAnonymous}
                  onValueChange={() => setIsAnonymous(!isAnonymous)}
                  trackColor={{ false: '#d3d3d3', true: '#9a0f21' }}
                  thumbColor={isAnonymous ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Post Text Input */}
        <View style={styles.textInputSection}>
          <TextInput
            style={styles.postTextInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={postText}
            onChangeText={setPostText}
            textAlignVertical="top"
          />
        </View>

        {/* Media Upload Section */}
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Add Media</Text>
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
  postButton: {
    backgroundColor: '#9a0f21',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  postTextDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
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
  postTextInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 120,
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
  gifSection: {
    marginTop: 12,
  },
  gifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gifIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  gifLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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

export default CreatePostScreen; 
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const [postText, setPostText] = useState('');
  const [tagText, setTagText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handlePost = () => {
    // Handle post creation logic here
    console.log('Creating post:', { postText, tagText, isAnonymous });
    navigation.goBack();
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
          disabled={!postText.trim()}
        >
          <Text style={[
            styles.postText, 
            !postText.trim() && styles.postTextDisabled
          ]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/48' }} 
            style={styles.userAvatar} 
          />
          <View style={styles.userInfo}>
            <View style={styles.anonymousToggle}>
              <Text style={styles.usernameText}>
                {isAnonymous ? 'Anonymous' : 'Your Name'}
              </Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Anonymous</Text>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: '#d3d3d3', true: '#007AFF' }}
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

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="Add tags (e.g., #study #campus #food)"
            placeholderTextColor="#999"
            value={tagText}
            onChangeText={setTagText}
          />
        </View>

        {/* Media Upload Section */}
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Add Media</Text>
          <View style={styles.mediaGrid}>
            <MediaUploadBox icon="📷" label="Photo" />
            <MediaUploadBox icon="📷" label="Photo" />
            <MediaUploadBox icon="📷" label="Photo" />
          </View>
          <View style={styles.gifSection}>
            <TouchableOpacity style={styles.gifButton}>
              <Text style={styles.gifIcon}>🎬</Text>
              <Text style={styles.gifLabel}>Add GIF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.sendButton, !postText.trim() && styles.sendButtonDisabled]}
          onPress={handlePost}
          disabled={!postText.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color={postText.trim() ? 'white' : '#ccc'} 
          />
          <Text style={[
            styles.sendButtonText, 
            !postText.trim() && styles.sendButtonTextDisabled
          ]}>
            Send Post
          </Text>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
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
    backgroundColor: '#007AFF',
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mediaBox: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaLabel: {
    fontSize: 12,
    color: '#666',
  },
  gifSection: {
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  sendButtonTextDisabled: {
    color: '#ccc',
  },
});

export default CreatePostScreen; 
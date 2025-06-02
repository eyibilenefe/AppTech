import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const WriteCommentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId } = route.params;
  const [commentText, setCommentText] = useState('');
  const [tagText, setTagText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleComment = () => {
    // Handle comment creation logic here
    console.log('Creating comment:', { commentText, tagText, isAnonymous, postId });
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
        <Text style={styles.headerTitle}>Write Comment</Text>
        <TouchableOpacity 
          onPress={handleComment} 
          style={[styles.headerButton, styles.commentButton]}
          disabled={!commentText.trim()}
        >
          <Text style={[
            styles.commentButtonText, 
            !commentText.trim() && styles.commentButtonTextDisabled
          ]}>
            Reply
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Replying To Section */}
        <View style={styles.replyingToSection}>
          <Text style={styles.replyingToText}>Replying to post #{postId}</Text>
          <MaterialIcons name="reply" size={16} color="#666" style={styles.replyIcon} />
        </View>

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
                  trackColor={{ false: '#d3d3d3', true: '#9a0f21' }}
                  thumbColor={isAnonymous ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
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

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="Add tags (e.g., #helpful #question)"
            placeholderTextColor="#999"
            value={tagText}
            onChangeText={setTagText}
          />
        </View>

        {/* Media Upload Section */}
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Add Media (Optional)</Text>
          <View style={styles.mediaGrid}>
            <MediaUploadBox icon="📷" label="Photo" />
            <MediaUploadBox icon="📷" label="Photo" />
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleComment}
          disabled={!commentText.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color={commentText.trim() ? 'white' : '#ccc'} 
          />
          <Text style={[
            styles.sendButtonText, 
            !commentText.trim() && styles.sendButtonTextDisabled
          ]}>
            Send Reply
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
    lineHeight: 24,
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
    justifyContent: 'flex-start',
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
    marginRight: '3.5%',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaLabel: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#28a745',
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

export default WriteCommentScreen; 
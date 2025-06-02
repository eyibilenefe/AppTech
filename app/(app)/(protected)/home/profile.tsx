import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Activity {
  id: string;
  type: 'post' | 'comment';
  content: string;
  timestamp: string;
  topic: string;
}

const ProfileScreen = () => {
  const router = useRouter();

  const userData = {
    fullName: 'Ahmet Yılmaz',
    studentNumber: '280201001',
    department: 'Computer Engineering',
    grade: '3rd Year',
    email: 'ahmet.yilmaz@std.iyte.edu.tr',
    joinDate: 'September 2021',
  };

  const chatbotActivity: Activity[] = [
    {
      id: '1',
      type: 'post',
      content: 'Asked about cafeteria opening hours and today\'s menu',
      timestamp: '2 hours ago',
      topic: 'Cafeteria Services',
    },
    {
      id: '2',
      type: 'comment',
      content: 'Inquired about gym equipment availability',
      timestamp: '1 day ago',
      topic: 'Sports Facilities',
    },
    {
      id: '3',
      type: 'post',
      content: 'Requested information about library study room reservations',
      timestamp: '2 days ago',
      topic: 'Library Services',
    },
    {
      id: '4',
      type: 'comment',
      content: 'Asked about balance top-up methods',
      timestamp: '3 days ago',
      topic: 'Payment Services',
    },
    {
      id: '5',
      type: 'post',
      content: 'Checked campus event schedule',
      timestamp: '1 week ago',
      topic: 'Campus Events',
    },
  ];

  const handleBackPress = () => {
    router.back();
  };

  const renderActivity = (activity: Activity) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <MaterialIcons 
          name={activity.type === 'post' ? 'chat-bubble' : 'comment'} 
          size={20} 
          color="#9a0f21" 
        />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTopic}>{activity.topic}</Text>
          <Text style={styles.activityTime}>{activity.timestamp}</Text>
        </View>
        <Text style={styles.activityText}>{activity.content}</Text>
        <Text style={styles.activityType}>
          {activity.type === 'post' ? 'Question' : 'Follow-up'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <MaterialIcons name="edit" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <View style={styles.coverImage}>
            <MaterialIcons name="landscape" size={48} color="#ccc" />
          </View>
          
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={48} color="#9a0f21" />
            </View>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userData.fullName}</Text>
          <Text style={styles.userTitle}>{userData.department}</Text>
          
          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="badge" size={16} color="#666" />
              <Text style={styles.detailText}>Student No: {userData.studentNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="school" size={16} color="#666" />
              <Text style={styles.detailText}>{userData.grade}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={16} color="#666" />
              <Text style={styles.detailText}>{userData.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={16} color="#666" />
              <Text style={styles.detailText}>Joined {userData.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="chat" size={24} color="#9a0f21" />
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Bot Conversations</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="help" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Questions Asked</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={24} color="#FF6B35" />
            <Text style={styles.statNumber}>19</Text>
            <Text style={styles.statLabel}>Resolved Issues</Text>
          </View>
        </View>

        {/* Chatbot Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chatbot Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {chatbotActivity.map(renderActivity)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="settings" size={20} color="#9a0f21" />
            <Text style={styles.actionButtonText}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="history" size={20} color="#9a0f21" />
            <Text style={styles.actionButtonText}>Chat History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="privacy-tip" size={20} color="#9a0f21" />
            <Text style={styles.actionButtonText}>Privacy Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#9a0f21',
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
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  coverContainer: {
    position: 'relative',
    marginBottom: 60,
  },
  coverImage: {
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  userInfoContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: '#9a0f21',
    marginBottom: 16,
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
  seeAllText: {
    fontSize: 14,
    color: '#9a0f21',
    fontWeight: '600',
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
  activityTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '600',
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
});

export default ProfileScreen; 
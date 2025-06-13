import { useSupabase } from '@/context/supabase-provider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SettingsScreen = () => {
  const router = useRouter();
  const [darkTheme, setDarkTheme] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleBackPress = () => {
    router.back();
  };

  const handleInviteFriend = () => {
    Alert.alert(
      'Invite Friend',
      'Share the IYTE Campus app with your friends!',
      [{ text: 'OK' }]
    );
  };

  const handleClearMessages = () => {
    Alert.alert(
      'Clear Chatbot Messages',
      'Are you sure you want to clear all your chatbot conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive' },
      ]
    );
  };


  const { signOut } = useSupabase();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {
          signOut();
        } },
      ]
    );
    
  };

  // Mock screen time data
  const screenTimeData = {
    today: '4h 23m',
    percentage: 75,
    breakdown: [
      { category: 'Chatbot', time: '1h 45m', color: '#9a0f21' },
      { category: 'Food Services', time: '1h 12m', color: '#FF6B35' },
      { category: 'Sports', time: '52m', color: '#4CAF50' },
      { category: 'Other', time: '34m', color: '#9C27B0' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Screen Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Screen Time</Text>
          
          <View style={styles.screenTimeCard}>
            <View style={styles.screenTimeHeader}>
              <Text style={styles.screenTimeTitle}>Today's Usage</Text>
              <Text style={styles.screenTimeValue}>{screenTimeData.today}</Text>
            </View>
            
            {/* Circular Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircle}>
                <View style={[styles.progressFill, { transform: [{ rotate: `${screenTimeData.percentage * 3.6}deg` }] }]} />
                <View style={styles.progressInner}>
                  <Text style={styles.progressText}>{screenTimeData.percentage}%</Text>
                  <Text style={styles.progressLabel}>of daily limit</Text>
                </View>
              </View>
            </View>

            {/* Usage Breakdown */}
            <View style={styles.breakdownContainer}>
              {screenTimeData.breakdown.map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                  <Text style={styles.breakdownTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="dark-mode" size={24} color="#666" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Dark Theme</Text>
                  <Text style={styles.preferenceDescription}>Enable dark mode for better night usage</Text>
                </View>
              </View>
              <Switch
                value={darkTheme}
                onValueChange={setDarkTheme}
                trackColor={{ false: '#e0e0e0', true: '#9a0f21' }}
                thumbColor={darkTheme ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="notifications" size={24} color="#666" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Notifications</Text>
                  <Text style={styles.preferenceDescription}>Receive updates and announcements</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#e0e0e0', true: '#9a0f21' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleInviteFriend}>
              <MaterialIcons name="person-add" size={24} color="#4CAF50" />
              <Text style={styles.actionLabel}>Invite Your Friend</Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionItem} onPress={handleClearMessages}>
              <MaterialIcons name="clear-all" size={24} color="#FF6B35" />
              <Text style={styles.actionLabel}>Clear Chatbot Messages</Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionItem} onPress={() => {
              handleLogout();
            }}>
              <MaterialIcons name="exit-to-app" size={24} color="#FF4757" />
              <Text style={[styles.actionLabel, { color: '#FF4757' }]}>Log Out</Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.2.3</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build Number</Text>
              <Text style={styles.infoValue}>2024.01.15</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>IYTE IT Department</Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  screenTimeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  screenTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  screenTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#9a0f21',
    transformOrigin: 'center',
  },
  progressInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
  },
  breakdownContainer: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownCategory: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  breakdownTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  preferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen; 
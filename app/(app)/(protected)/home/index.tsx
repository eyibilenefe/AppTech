import { Image } from '@/components/image';
import { useSupabase } from '@/context/supabase-provider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const HomeScreen = () => {
  const router = useRouter();

  const userData = useSupabase().profile;

  const handleNavigation = (screen: string) => {
    router.push(`./home/${screen}` as any);
  };

  const actionButtons = [
    { title: 'Bakiye Yükle', icon: 'account-balance-wallet', screen: 'top-up' },
    { title: 'QR ile Öde', icon: 'qr-code-scanner', screen: 'qr-payment' },
    { title: 'Yemek Randevu', icon: 'restaurant', screen: 'cafeteria-reservation' },
    { title: 'Spor Randevu', icon: 'fitness-center', screen: 'facility-reservation' },
    { title: 'Calendar', icon: 'calendar-today', screen: 'calendar' },
    { title: 'Profile', icon: 'person', screen: 'profile' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Settings */}
      <View style={styles.header}>
      <View>
				<View 
					className="w-16 h-16 bg-white rounded-full justify-center items-center"
					style={{
						elevation: 4,
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
					}}
				>
					<Image
						source={require("@/assets/images/logo/dc-logo-red.png")}
						className="w-12 h-12"
						resizeMode="contain"
					/>
				</View>
			</View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => handleNavigation('settings')}
        >
          <MaterialIcons name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Digital Card */}
        <View style={styles.digitalCard}>
          <View style={styles.cardHeader}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="school" size={40} color="#9a0f21" />
              <Text style={styles.logoText}>IYTE</Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              {/* <Text style={styles.balanceAmount}>{userData?.balance}</Text> */}
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.userName}>{userData?.name}</Text>
            <Text style={styles.studentNumber}>Student No: {userData?.st_id}</Text>
            <Text style={styles.department}>{userData?.dept}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardChip} />
            <Text style={styles.cardType}>Student ID</Text>
          </View>
        </View>

        {/* Action Buttons Grid */}
        <View style={styles.actionGrid}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleNavigation(button.screen)}
            >
              <View style={styles.actionIconContainer}>
                <MaterialIcons 
                  name={button.icon as any} 
                  size={28} 
                  color="#9a0f21" 
                />
              </View>
              <Text style={styles.actionButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="restaurant" size={24} color="#FF6B35" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Meals This Month</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Gym Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="payment" size={24} color="#9C27B0" />
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => handleNavigation('ai-chat')}
      >
        <MaterialIcons name="smart-toy" size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  digitalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardBody: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
    color: '#9a0f21',
    marginBottom: 2,
  },
  grade: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 32,
    height: 24,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
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
  aiButton: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9a0f21',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;

import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const QRPaymentScreen = () => {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Payment</Text>
        <TouchableOpacity style={styles.flashButton}>
          <MaterialIcons name="flash-off" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {/* Corner overlays */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Center content */}
          <View style={styles.scannerContent}>
            <MaterialIcons name="qr-code-scanner" size={64} color="#fff" />
            <Text style={styles.scannerText}>Scanner Active</Text>
            <Text style={styles.scannerSubtext}>Position QR code within the frame</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to pay with QR:</Text>
          <View style={styles.instructionItem}>
            <MaterialIcons name="filter-1" size={20} color="#9a0f21" />
            <Text style={styles.instructionText}>Position the QR code within the frame</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="filter-2" size={20} color="#9a0f21" />
            <Text style={styles.instructionText}>Wait for automatic scan detection</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="filter-3" size={20} color="#9a0f21" />
            <Text style={styles.instructionText}>Confirm payment amount and complete</Text>
          </View>
        </View>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#4CAF50" />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>124.50 ₺</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="history" size={20} color="#9a0f21" />
          <Text style={styles.actionText}>Payment History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="help-outline" size={20} color="#9a0f21" />
          <Text style={styles.actionText}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing for Tab Navigation */}
      <View style={styles.bottomSpacing} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  flashButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#9a0f21',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerContent: {
    alignItems: 'center',
    gap: 12,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scannerSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9a0f21',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default QRPaymentScreen; 
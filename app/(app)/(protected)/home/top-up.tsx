import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TopUpScreen = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const amountOptions = [20, 50, 100, 150, 200, 500];

  const handleBackPress = () => {
    router.back();
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleCompletePayment = () => {
    if (!cardNumber || !userName || !expiryDate || !cvv || !selectedAmount) {
      Alert.alert('Error', 'Please fill in all fields and select an amount');
      return;
    }

    Alert.alert(
      'Payment Confirmation',
      `Are you sure you want to add ${selectedAmount}₺ to your balance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Payment completed successfully!');
            router.back();
          }
        },
      ]
    );
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    const formatted = chunks.join(' ');
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top-up Balance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <MaterialIcons name="account-balance-wallet" size={32} color="#4CAF50" />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>124.50 ₺</Text>
          </View>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {amountOptions.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                <Text style={[
                  styles.amountButtonText,
                  selectedAmount === amount && styles.amountButtonTextSelected
                ]}>
                  {amount}₺
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="John Doe"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        {selectedAmount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Top-up Amount</Text>
                <Text style={styles.summaryValue}>{selectedAmount}₺</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Fee</Text>
                <Text style={styles.summaryValue}>0₺</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Total Amount</Text>
                <Text style={styles.summaryValueTotal}>{selectedAmount}₺</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New Balance</Text>
                <Text style={styles.summaryValueNew}>{(124.50 + selectedAmount).toFixed(2)}₺</Text>
              </View>
            </View>
          </View>
        )}

        {/* Complete Payment Button */}
        <TouchableOpacity 
          style={[
            styles.paymentButton,
            (!cardNumber || !userName || !expiryDate || !cvv || !selectedAmount) && styles.paymentButtonDisabled
          ]}
          onPress={handleCompletePayment}
          disabled={!cardNumber || !userName || !expiryDate || !cvv || !selectedAmount}
        >
          <MaterialIcons name="credit-card" size={20} color="#fff" />
          <Text style={styles.paymentButtonText}>Complete Payment</Text>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <MaterialIcons name="security" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
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
    padding: 16,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountButton: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  amountButtonSelected: {
    borderColor: '#9a0f21',
    backgroundColor: '#f0f8ff',
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amountButtonTextSelected: {
    color: '#9a0f21',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  summaryValueNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9a0f21',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default TopUpScreen; 
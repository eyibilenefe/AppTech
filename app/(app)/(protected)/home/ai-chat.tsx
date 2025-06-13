import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChatScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m IYTE-bot, your campus assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('cafeteria') || input.includes('food') || input.includes('meal')) {
      return 'The cafeteria is open from 11:30 AM to 9:00 PM. Today\'s menu includes grilled chicken, vegetarian pasta, and fresh salads. You can make reservations through the app!';
    } else if (input.includes('gym') || input.includes('sport') || input.includes('fitness')) {
      return 'The sports center is open from 8:00 AM to 10:00 PM. Available facilities include gym, tennis courts, basketball courts, and swimming pool. Would you like to make a reservation?';
    } else if (input.includes('library') || input.includes('study')) {
      return 'The library is open 24/7 for students. You can reserve study rooms through the campus portal. Current capacity is at 65%.';
    } else if (input.includes('balance') || input.includes('money') || input.includes('payment')) {
      return 'Your current balance is 124.50 ₺. You can top up your balance using the "Bakiye Yükle" feature in the app or at campus kiosks.';
    } else if (input.includes('help') || input.includes('?')) {
      return 'I can help you with:\n• Cafeteria information and reservations\n• Sports facility bookings\n• Library services\n• Campus balance and payments\n• General campus information\n\nWhat would you like to know?';
    } else {
      return 'I understand you\'re asking about campus services. Could you be more specific? I can help with cafeteria, sports facilities, library, balance inquiries, and general campus information.';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, item.isUser ? styles.userTime : styles.botTime]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>IYTE-bot</Text>
          <Text style={styles.headerSubtitle}>Campus Assistant</Text>
        </View>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="smart-toy" size={24} color="#fff" />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
      style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={inputText.trim() ? "#fff" : "#999"} 
          />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
      {/* Bottom Spacing for Tab Navigation */}
      <View style={styles.bottomSpacing} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
		bottom: 45,
	},
  header: {
    flexDirection: 'row',
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
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
    marginBottom: 50,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#9a0f21',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    bottom: 0,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#9a0f21',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AIChatScreen; 
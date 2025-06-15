import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { supabase } from '../../../../utils/supabase';
import {
  AIMessage,
  ChatMessage,
  getChatHistory,
  sendMessageToGeminiWithDB
} from '../../../api/gemini-chat';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

const AIChatScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList>(null);

  // Kullanıcı authentication state'ini kontrol et
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Chat geçmişini database'den yükle
  const loadChatHistory = async () => {
    try {
      const result = await getChatHistory(userId, 50);
      if (result.success && result.messages) {        const dbMessages: Message[] = result.messages.map((msg: AIMessage, index: number) => ({
          id: msg.id || index.toString(),
          text: msg.message || '',
          isUser: msg.type === 'human',
          timestamp: msg.message_date ? new Date(msg.message_date) : new Date(),
        }));
        
        // Eğer mesaj yoksa hoş geldin mesajı ekle
        if (dbMessages.length === 0) {
          setMessages([{
            id: '1',
            text: 'Merhaba! Ben İYTE Rektörü Yusuf Baran. Size nasıl yardımcı olabilirim?',
            isUser: false,
            timestamp: new Date(),
          }]);
        } else {
          setMessages(dbMessages);
        }
        
        // Chat history için Gemini format'ına çevir
        const geminiHistory: ChatMessage[] = result.messages.map((msg: AIMessage) => ({
          role: msg.type === 'human' ? 'user' : 'model',
          parts: msg.message,
        }));
        setChatHistory(geminiHistory);
      }
    } catch (error) {
      console.error('Chat history load error:', error);
      // Hata durumunda default mesajı göster
      setMessages([{
        id: '1',
        text: 'Merhaba! Ben İYTE Rektörü Yusuf Baran. Size nasıl yardımcı olabilirim?',
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  };

  // Component mount edildiğinde chat geçmişini yükle
  useEffect(() => {
    loadChatHistory();
  }, [userId]);

  const handleBackPress = () => {
    router.back();
  };
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const currentInput = inputText.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Yazıyor...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {      // Gemini API'ye mesaj gönder ve database'e kaydet
      const response = await sendMessageToGeminiWithDB(currentInput, userId, chatHistory);
      
      // Loading mesajını kaldır
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      let botResponseText: string;
      
      if (response.success) {
        botResponseText = response.message;
        
        // Chat geçmişini güncelle
        setChatHistory(prev => [
          ...prev,
          { role: 'user', parts: currentInput },
          { role: 'model', parts: response.message },
        ]);      } else {
        // API hatası durumunda genel hata mesajı
        botResponseText = 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.';
        console.warn('Gemini API Error:', response.error);
      }

      const botResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      // Loading mesajını kaldır
      setMessages(prev => prev.filter(msg => !msg.isLoading));
        // Hata durumunda genel hata mesajı
      const fallbackResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
      // Scroll to bottom after response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        {item.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#9a0f21" />
            <Text style={styles.loadingText}>Rektörün yazıyor...</Text>
          </View>        ) : (
          <>
            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
              {item.text ?? ''}
            </Text>
            <Text style={[styles.messageTime, item.isUser ? styles.userTime : styles.botTime]}>
              {item.timestamp ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </>
        )}
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
      </View>      {/* Messages */}
      <FlatList
        ref={flatListRef}
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
        />        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons 
              name="send" 
              size={20} 
              color={inputText.trim() ? "#fff" : "#999"} 
            />
          )}
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
  },  sendButtonActive: {
    backgroundColor: '#9a0f21',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AIChatScreen; 
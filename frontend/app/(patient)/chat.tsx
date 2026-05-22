import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiPost } from '../../lib/apiClient';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const PSG_RED = '#BA1A21';
const PSG_BG = '#F5F5F5';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function PatientChat() {
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-1',
      role: 'assistant',
      content: 'Ask me about your upcoming procedures, doctor notes, or what the Tumor Board recommended.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const buildPayload = (message: string) => ({
    message,
    patient: {
      opNumber: user?.opid,
      name: user?.patient_name || user?.name,
    },
  });

  const sendMessage = async () => {
    const trimmedMessage = inputText.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    console.log('Chat backend URL:', BACKEND_URL);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInputText('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const response = await apiPost(`${BACKEND_URL}/api/chat`, buildPayload(trimmedMessage));

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Chat request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
      }

      const data = await response.json();
      const replyText = data?.reply || data?.answer || 'I could not generate a response for that question.';

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText,
        },
      ]);
    } catch (error) {
      console.error('Chat request error:', error);
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: 'The hospital assistant is temporarily unavailable. Please try again after reconnecting to the backend.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'When is my next procedure?',
    'What did the Tumor Board say about me?',
    'Do I need to prepare for anything before my biopsy?',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.kicker}>PSG Hospitals AI</Text>
            <Text style={styles.headerTitle}>Patient Chat</Text>
            <Text style={styles.headerSubtitle}>Answers are generated from the logged-in patient record only.</Text>
          </View>
          <View style={styles.patientBadge}>
            <Ionicons name="medkit-outline" size={18} color={PSG_RED} />
            <Text style={styles.patientBadgeText}>{user?.opid || 'Patient'}</Text>
          </View>
        </View>
        {/* context card removed to maximize chat area */}

        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={[styles.messageText, message.role === 'user' ? styles.userMessageText : null]}>{message.content}</Text>
            </View>
          ))}

          {isLoading ? (
            <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
              <ActivityIndicator color={PSG_RED} />
            </View>
          ) : null}
        </ScrollView>

        {showSuggestions ? (
          <View style={styles.suggestionRow}>
            {quickPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                style={styles.suggestionChip}
                onPress={() => setInputText(prompt)}
              >
                <Text style={styles.suggestionText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about your treatment, notes, or schedule..."
            placeholderTextColor="#8A8A8A"
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (isLoading || !inputText.trim()) && styles.sendButtonDisabled,
              pressed && !isLoading && inputText.trim() ? styles.sendButtonPressed : null,
            ]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PSG_BG,
  },
  container: {
    flex: 1,
    backgroundColor: PSG_BG,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  kicker: {
    color: PSG_RED,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#222222',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 13,
    marginTop: 6,
    flexShrink: 1,
    lineHeight: 19,
  },
  patientBadge: {
    backgroundColor: '#FFF3F4',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientBadgeText: {
    color: PSG_RED,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  contextCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: PSG_RED,
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  contextText: {
    marginTop: 4,
    color: '#666666',
    fontSize: 13,
    lineHeight: 18,
  },
  chatArea: {
    flex: 1,
    marginTop: 12,
  },
  chatContent: {
    paddingBottom: 140,
  },
  messageBubble: {
    maxWidth: '84%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: PSG_RED,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  loadingBubble: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F1F1F',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 18,
  },
  textInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222222',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PSG_RED,
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
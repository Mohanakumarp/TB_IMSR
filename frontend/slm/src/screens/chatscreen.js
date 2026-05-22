import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';

// ⚠️ CRITICAL: Replace '192.168.X.X' with your laptop's actual Wi-Fi IPv4 Address
const BACKEND_URL = 'http://172.20.10.4:8000/api/patient-helpdesk';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the PSGIMSR Helpdesk. How can I help you prepare for your procedure today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // 1. Add user message to UI immediately
    const userMessage = { role: 'user', content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Send to your Express Backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opNumber: 'OP-12345',
          message: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      // 3. Receive full text from Express and add to UI
      const textResponse = await response.text();
      setMessages((prev) => [...prev, { role: 'assistant', content: textResponse }]);
      
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I cannot reach the hospital servers right now. Please check your connection.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {messages.map((msg, index) => (
          <View 
            key={index} 
            style={[
              styles.messageBubble, 
              msg.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble, { width: 60 }]}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about your procedure..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1117',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  userBubble: {
    backgroundColor: '#2563EB', // Blue
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: '#374151', // Gray
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    height: 50,
  },
  sendButton: {
    justifyContent: 'center',
    marginLeft: 10,
    backgroundColor: '#2563EB',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
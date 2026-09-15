import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../src/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'मेरा नंबर कब आएगा? (When is my turn?)',
  'आज गेहूं का मंडी भाव क्या है? (Today Wheat rate)',
  'क्वालिटी चेकिंग में क्या देखा जाता है? (QC rules)',
  'पेमेंट कब तक बैंक खाते में आएगी? (Payment status)'
];

export default function AssistantScreen() {
  const { i18n } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'नमस्कार किसान भाई! मैं किसानिफाई AI सहायक हूँ। आप अपनी भाषा में मुझसे कतार स्थिति, टोकन नंबर या आज के मंडी भाव के बारे में पूछ सकते हैं।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await apiFetch<{ reply: string }>('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          language: i18n.language || 'hi'
        })
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'माफ़ कीजिये, अभी जानकारी प्राप्त करने में समस्या आ रही है। कृपया पुनः प्रयास करें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Ground-Truth AI • SIH 2026</Text>
        <Text style={styles.title}>🤖 Multilingual Kisan Assistant</Text>
        <Text style={styles.subtitle}>Grounded in your live slot, queue position & official MSP rates</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatScroll} ref={ref => ref?.scrollToEnd({ animated: true })}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgBubble,
              msg.sender === 'user' ? styles.userBubble : styles.assistantBubble
            ]}
          >
            <Text style={[styles.msgText, msg.sender === 'user' ? styles.userMsgText : styles.assistantMsgText]}>
              {msg.text}
            </Text>
            <Text style={[styles.timeText, msg.sender === 'user' ? styles.userTimeText : styles.assistantTimeText]}>
              {msg.timestamp}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.msgBubble, styles.assistantBubble]}>
            <ActivityIndicator color="#0F5132" size="small" />
            <Text style={{ fontSize: 12, color: '#0F5132', marginTop: 4 }}>Fetching live mandi context...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      <View style={styles.quickPromptsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(prompt)}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask in Hindi, Punjabi, English, Marathi..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={loading}>
          <Text style={styles.sendText}>Send →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  chatScroll: {
    padding: 16,
    gap: 12
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 6
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F5132',
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22
  },
  userMsgText: {
    color: '#FFFFFF'
  },
  assistantMsgText: {
    color: '#111827'
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  userTimeText: {
    color: '#E8F5E9'
  },
  assistantTimeText: {
    color: '#9CA3AF'
  },
  quickPromptsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  promptsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  promptChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  promptText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    fontSize: 15
  },
  sendButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15
  }
});

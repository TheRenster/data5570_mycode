import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage } from '@/store/messagesSlice';
import { AppDispatch, RootState } from '@/store';
import { useLocalSearchParams } from 'expo-router';

export default function MessagesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const { myProfile } = useSelector((state: RootState) => state.profile);
  const { allMessages } = useSelector((state: RootState) => state.messages);
  const [body, setBody] = useState('');

  const otherProfileId = params.otherProfileId ? Number(params.otherProfileId) : null;
  const otherName = params.otherName as string || 'Unknown';

  useEffect(() => {
    if (myProfile?.id) dispatch(fetchMessages(myProfile.id));
  }, [myProfile]);

  const thread = otherProfileId
    ? allMessages.filter((m: any) =>
        (m.sender === myProfile?.id && m.receiver === otherProfileId) ||
        (m.receiver === myProfile?.id && m.sender === otherProfileId)
      )
    : [];

  const conversations = allMessages.reduce((acc: any, m: any) => {
    const otherId = m.sender === myProfile?.id ? m.receiver : m.sender;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(m);
    return acc;
  }, {});

  const handleSend = async () => {
    if (!body.trim() || !myProfile?.id || !otherProfileId) return;
    await dispatch(sendMessage({ sender: myProfile.id, receiver: otherProfileId, body }));
    setBody('');
    dispatch(fetchMessages(myProfile.id));
  };

  if (!myProfile) {
    return <View style={styles.center}><Text>Set up your profile first!</Text></View>;
  }

  if (!otherProfileId) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>💬 Messages</Text>
        {Object.keys(conversations).length === 0 ? (
          <Text style={styles.empty}>No messages yet. Find a match and start a conversation!</Text>
        ) : (
          Object.keys(conversations).map((otherId) => {
            const msgs = conversations[otherId];
            const last = msgs[msgs.length - 1];
            return (
              <View key={otherId} style={styles.convoCard}>
                <Text style={styles.convoName}>User #{otherId}</Text>
                <Text style={styles.convoPreview}>{last.body}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>💬 {otherName}</Text>
      <ScrollView style={styles.thread}>
        {thread.map((m: any, i: number) => (
          <View key={i} style={[styles.bubble, m.sender === myProfile.id ? styles.mine : styles.theirs]}>
            <Text style={styles.bubbleText}>{m.body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={body} onChangeText={setBody} placeholder="Type a message..." />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1877F2' },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  thread: { flex: 1 },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#1877F2' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#f0f2f5' },
  bubbleText: { color: '#fff', fontSize: 15 },
  inputRow: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtn: { backgroundColor: '#1877F2', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
  convoCard: { backgroundColor: '#f0f2f5', borderRadius: 10, padding: 14, marginBottom: 10 },
  convoName: { fontWeight: 'bold', fontSize: 16 },
  convoPreview: { color: '#666', marginTop: 4 },
});

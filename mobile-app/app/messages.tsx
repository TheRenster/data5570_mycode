import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage } from '@/store/messagesSlice';
import { AppDispatch, RootState } from '@/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenShell } from '@/components/ScreenShell';
import { theme } from '@/constants/theme';

export default function MessagesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { myProfile } = useSelector((state: RootState) => state.profile);
  const { allProfiles } = useSelector((state: RootState) => state.profile);
  const { allMessages } = useSelector((state: RootState) => state.messages);
  const [body, setBody] = useState('');

  const otherProfileId = params.otherProfileId ? Number(params.otherProfileId) : null;
  const otherName = (params.otherName as string) || 'Unknown';

  useEffect(() => {
    if (myProfile?.id) dispatch(fetchMessages((myProfile as { id: number }).id));
  }, [myProfile, dispatch]);

  const senderId = (m: any) => (typeof m.sender === 'object' ? m.sender?.id : m.sender);
  const receiverId = (m: any) => (typeof m.receiver === 'object' ? m.receiver?.id : m.receiver);

  const myId = (myProfile as { id?: number } | null)?.id;

  const thread = otherProfileId
    ? allMessages.filter(
        (m: any) =>
          (senderId(m) === myId && receiverId(m) === otherProfileId) ||
          (receiverId(m) === myId && senderId(m) === otherProfileId)
      )
    : [];

  const conversations = allMessages.reduce((acc: Record<string, any[]>, m: any) => {
    const oid = senderId(m) === myId ? receiverId(m) : senderId(m);
    if (!acc[oid]) acc[oid] = [];
    acc[oid].push(m);
    return acc;
  }, {});

  const nameForId = (id: number) => {
    const p = allProfiles.find((x: any) => x.id === id);
    return p?.user_name ? String(p.user_name) : `Trader #${id}`;
  };

  const handleSend = async () => {
    if (!body.trim() || !myId || !otherProfileId) return;
    await dispatch(sendMessage({ sender: myId, receiver: otherProfileId, body: body.trim() }));
    setBody('');
    dispatch(fetchMessages(myId));
  };

  if (!myProfile) {
    return (
      <ScreenShell scroll>
        <View style={styles.center}>
          <Text style={styles.muted}>Set up your profile on the Profile tab first.</Text>
        </View>
      </ScreenShell>
    );
  }

  if (!otherProfileId) {
    return (
      <ScreenShell scroll>
        <Text style={styles.kicker}>Inbox</Text>
        <Text style={styles.headline}>Messages</Text>
        <Text style={styles.lead}>Open a thread from Browse, or tap a conversation below.</Text>
        {Object.keys(conversations).length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.muted}>No messages yet. Match with someone and tap Message.</Text>
          </View>
        ) : (
          Object.keys(conversations).map((key) => {
            const oid = Number(key);
            const msgs = conversations[key];
            const last = msgs[msgs.length - 1];
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.convoCard, pressed && styles.convoPressed]}
                onPress={() =>
                  router.push({
                    pathname: '/messages',
                    params: { otherProfileId: String(oid), otherName: nameForId(oid) },
                  })
                }>
                <Text style={styles.convoName}>{nameForId(oid)}</Text>
                <Text style={styles.convoPreview} numberOfLines={2}>
                  {last.body}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>‹ Inbox</Text>
        </TouchableOpacity>
        <Text style={styles.threadTitle}>{otherName}</Text>
        <ScrollView style={styles.thread} contentContainerStyle={styles.threadContent}>
          {thread.map((m: any, i: number) => {
            const mine = senderId(m) === myId;
            return (
              <View key={m.id ?? i} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text
                  style={[
                    styles.bubbleText,
                    mine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                  ]}>
                  {m.body}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={body}
            onChangeText={setBody}
            placeholder="Type a message…"
            placeholderTextColor={theme.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
  kicker: {
    color: theme.accent,
    fontSize: theme.fontSmall,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  lead: {
    fontSize: theme.fontSmall,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  muted: {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusLg,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.border,
  },
  convoCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusMd,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  convoPressed: {
    opacity: 0.92,
    borderColor: theme.primary,
  },
  convoName: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.text,
  },
  convoPreview: {
    color: theme.textMuted,
    marginTop: 6,
    fontSize: 14,
  },
  backRow: {
    marginBottom: 8,
  },
  backText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 12,
  },
  thread: { flex: 1 },
  threadContent: { paddingBottom: 16 },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface2,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#fff',
  },
  bubbleTextTheirs: {
    color: theme.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 2,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
});

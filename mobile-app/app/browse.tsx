import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMatches } from '@/store/matchesSlice';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'expo-router';

export default function BrowseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { myProfile } = useSelector((state: RootState) => state.profile);
  const { matches, loading } = useSelector((state: RootState) => state.matches);

  useEffect(() => {
    if (myProfile?.id) dispatch(fetchMatches(myProfile.id));
  }, [myProfile]);

  if (!myProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Set up your profile first! →</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#1877F2" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Your Matches</Text>
      {matches.length === 0 ? (
        <Text style={styles.empty}>No matches yet — add more offers and wants to your profile!</Text>
      ) : (
        matches.map((match: any, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.name}>👤 {match.profile.user_name}</Text>
            <Text style={styles.detail}>🎁 They offer: <Text style={styles.highlight}>{match.they_offer}</Text></Text>
            <Text style={styles.detail}>✅ You offer them: <Text style={styles.highlight}>{match.you_offer}</Text></Text>
            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() => router.push({ pathname: '/messages', params: { otherProfileId: match.profile.id, otherName: match.profile.user_name } })}
            >
              <Text style={styles.msgBtnText}>💬 Message</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1877F2' },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#f0f2f5', borderRadius: 12, padding: 16, marginBottom: 16 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  detail: { fontSize: 14, color: '#444', marginBottom: 4 },
  highlight: { fontWeight: 'bold', color: '#1877F2' },
  msgBtn: { backgroundColor: '#1877F2', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  msgBtnText: { color: '#fff', fontWeight: 'bold' },
});

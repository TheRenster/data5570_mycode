import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile } from '@/store/profileSlice';
import { createListing } from '@/store/listingsSlice';
import { AppDispatch, RootState } from '@/store';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { myProfile, loading } = useSelector((state: RootState) => state.profile);

  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [wantInput, setWantInput] = useState('');
  const [offers, setOffers] = useState<{title: string, isLocal: boolean}[]>([]);
  const [wants, setWants] = useState<string[]>([]);

  const addOffer = () => {
    if (!offerInput.trim()) return;
    setOffers([...offers, { title: offerInput.trim(), isLocal: false }]);
    setOfferInput('');
  };

  const toggleLocal = (index: number) => {
    const updated = [...offers];
    updated[index].isLocal = !updated[index].isLocal;
    setOffers(updated);
  };

  const addWant = () => {
    if (!wantInput.trim()) return;
    setWants([...wants, wantInput.trim()]);
    setWantInput('');
  };

  const handleSubmit = async () => {
    if (!userName.trim()) { Alert.alert('Name required'); return; }
    const profileResult = await dispatch(createProfile({
      user_name: userName,
      bio,
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
    }));

    const profile = (profileResult.payload as any);
    if (!profile?.id) { Alert.alert('Failed to create profile'); return; }

    for (const offer of offers) {
      await dispatch(createListing({ profile: profile.id, title: offer.title, listing_type: 'offer', is_local: offer.isLocal }));
    }
    for (const want of wants) {
      await dispatch(createListing({ profile: profile.id, title: want, listing_type: 'want', is_local: false }));
    }
    Alert.alert('Profile created! Head to Browse to find matches.');
  };

  if (myProfile) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>👤 {myProfile.user_name}</Text>
        <Text style={styles.sub}>{myProfile.bio}</Text>
        <Text style={styles.label}>Profile saved! Browse your matches →</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏪 Facebook Barter Place</Text>
      <Text style={styles.label}>Your Name</Text>
      <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholder="Jane Smith" />
      <Text style={styles.label}>Bio</Text>
      <TextInput style={[styles.input, {height: 80}]} value={bio} onChangeText={setBio} placeholder="Tell people about yourself..." multiline />
      <Text style={styles.label}>Latitude (optional)</Text>
      <TextInput style={styles.input} value={lat} onChangeText={setLat} placeholder="40.7608" keyboardType="numeric" />
      <Text style={styles.label}>Longitude (optional)</Text>
      <TextInput style={styles.input} value={lon} onChangeText={setLon} placeholder="-111.8910" keyboardType="numeric" />

      <Text style={styles.sectionTitle}>What I Can Offer</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, {flex:1}]} value={offerInput} onChangeText={setOfferInput} placeholder="e.g. babysitting, haircut..." />
        <TouchableOpacity style={styles.addBtn} onPress={addOffer}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
      </View>
      {offers.map((o, i) => (
        <View key={i} style={styles.chip}>
          <Text style={styles.chipText}>{o.title}</Text>
          <TouchableOpacity onPress={() => toggleLocal(i)}>
            <Text style={[styles.localTag, o.isLocal && styles.localTagOn]}>{o.isLocal ? '📍 Local' : '🌐 Anywhere'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOffers(offers.filter((_,j) => j !== i))}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>What I'm Looking For</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, {flex:1}]} value={wantInput} onChangeText={setWantInput} placeholder="e.g. lamp, foot rub, ride..." />
        <TouchableOpacity style={styles.addBtn} onPress={addWant}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
      </View>
      {wants.map((w, i) => (
        <View key={i} style={styles.chip}>
          <Text style={styles.chipText}>{w}</Text>
          <TouchableOpacity onPress={() => setWants(wants.filter((_,j) => j !== i))}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Saving...' : 'Create Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1877F2' },
  sub: { fontSize: 16, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addBtn: { backgroundColor: '#1877F2', padding: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 20, padding: 8, marginBottom: 6, gap: 8 },
  chipText: { flex: 1, fontSize: 14 },
  localTag: { fontSize: 12, color: '#666', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  localTagOn: { color: '#1877F2', borderColor: '#1877F2' },
  remove: { color: '#999', fontSize: 16, paddingHorizontal: 4 },
  submitBtn: { backgroundColor: '#1877F2', padding: 16, borderRadius: 10, marginTop: 30, marginBottom: 50, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

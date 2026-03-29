import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile } from '@/store/profileSlice';
import { createListing } from '@/store/listingsSlice';
import { AppDispatch, RootState } from '@/store';
import { ScreenShell } from '@/components/ScreenShell';
import { theme } from '@/constants/theme';

function digitsOnly(s: string, maxLen: number) {
  return (s ?? '').replace(/\D/g, '').slice(0, maxLen);
}

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { myProfile, loading } = useSelector((state: RootState) => state.profile);
  const { width } = useWindowDimensions();
  const isWide = width >= 480;

  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [radiusMi, setRadiusMi] = useState(25);
  const [offerInput, setOfferInput] = useState('');
  const [wantInput, setWantInput] = useState('');
  const [offers, setOffers] = useState<{ title: string; isLocal: boolean }[]>([]);
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
    if (!userName.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    const zipDigits = digitsOnly(zipCode, 5);
    if (shareLocation && zipDigits.length !== 5) {
      Alert.alert('ZIP code', 'Enter a 5-digit US ZIP, or turn off location for online-only trades.');
      return;
    }

    let profile: { id: number };
    try {
      profile = (await dispatch(
        createProfile({
          user_name: userName.trim(),
          bio,
          zip_code: shareLocation ? zipDigits : '',
          search_radius_miles: radiusMi,
        }),
      ).unwrap()) as { id: number };
    } catch (err) {
      Alert.alert(
        'Could not save profile',
        typeof err === 'string' ? err : 'Network or server error. Check extra.apiUrl in app.json (or EXPO_PUBLIC_API_URL) and that Django is running.',
      );
      return;
    }

    if (!profile?.id) {
      Alert.alert('Error', 'Unexpected response from server.');
      return;
    }

    try {
      for (const offer of offers) {
        await dispatch(
          createListing({
            profile: profile.id,
            title: offer.title,
            listing_type: 'offer',
            is_local: offer.isLocal,
          }),
        ).unwrap();
      }
      for (const want of wants) {
        await dispatch(
          createListing({
            profile: profile.id,
            title: want,
            listing_type: 'want',
            is_local: false,
          }),
        ).unwrap();
      }
    } catch (err) {
      Alert.alert(
        'Profile saved — listing issue',
        typeof err === 'string'
          ? `${err}\n\nYour profile exists; fix offers/wants or try again.`
          : 'Could not save an offer or want.',
      );
      return;
    }

    Alert.alert('Saved', 'Profile created. Open Browse to see matches.');
  };

  if (myProfile) {
    const p = myProfile as {
      user_name?: string;
      bio?: string;
      zip_code?: string;
      search_radius_miles?: number;
      lat?: number | null;
      lon?: number | null;
    };
    return (
      <ScreenShell scroll>
        <View style={[styles.hero, isWide && styles.heroRow]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(p.user_name || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.title}>{p.user_name}</Text>
            <Text style={styles.sub}>{p.bio || 'No bio yet.'}</Text>
            {p.zip_code ? (
              <Text style={styles.meta}>
                📍 ZIP {p.zip_code} · local trades within {p.search_radius_miles ?? 25} mi
              </Text>
            ) : (
              <Text style={styles.meta}>No ZIP on file — local distance filters won&apos;t apply.</Text>
            )}
            <Text style={styles.hint}>
              Go to Browse to find trade partners, or Messages to chat.
            </Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll>
      <Text style={styles.kicker}>Barter Place</Text>
      <Text style={styles.headline}>Your profile</Text>
      <Text style={styles.lead}>
        List what you offer and what you want. Use a US ZIP and a search radius (1–50 mi) so local listings can
        use distance. The server looks up coordinates from your ZIP automatically.
      </Text>

      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="Jane Smith"
        placeholderTextColor={theme.textMuted}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.inputTall]}
        value={bio}
        onChangeText={setBio}
        placeholder="A sentence about you…"
        placeholderTextColor={theme.textMuted}
        multiline
      />

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.label}>Use ZIP for local trades</Text>
          <Text style={styles.switchHint}>
            When on, enter a 5-digit US ZIP. We convert it to coordinates on the server. “Local” offers then
            respect distance using your radius below (and the other person&apos;s).
          </Text>
        </View>
        <Switch
          value={shareLocation}
          onValueChange={setShareLocation}
          trackColor={{ false: theme.surface2, true: theme.primaryDim }}
          thumbColor="#fff"
        />
      </View>

      {shareLocation && (
        <>
          <Text style={styles.label}>ZIP code</Text>
          <TextInput
            style={styles.input}
            value={zipCode}
            onChangeText={(t) => setZipCode(digitsOnly(t, 5))}
            placeholder="84101"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            maxLength={5}
          />

          <Text style={styles.label}>Search radius (miles)</Text>
          <Text style={styles.sectionHint}>Used for local listings (1–50 mi). Stricter of you and match wins.</Text>
          <View style={styles.radiusRow}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadiusMi((r) => Math.max(1, r - 1))}
              accessibilityLabel="Decrease miles"
            >
              <Text style={styles.radiusBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.radiusValue}>{radiusMi} mi</Text>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadiusMi((r) => Math.min(50, r + 1))}
              accessibilityLabel="Increase miles"
            >
              <Text style={styles.radiusBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>I can offer</Text>
      <Text style={styles.sectionHint}>Tap “Local” if this item is only available in person nearby.</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={offerInput}
          onChangeText={setOfferInput}
          placeholder="e.g. babysitting, cookies, guitar lesson…"
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addOffer}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {offers.map((o, i) => (
        <View key={`o-${i}`} style={styles.chip}>
          <Text style={styles.chipText}>{o.title}</Text>
          <TouchableOpacity onPress={() => toggleLocal(i)} style={styles.localBtn}>
            <Text style={[styles.localTag, o.isLocal && styles.localTagOn]}>
              {o.isLocal ? '📍 Local' : '🌐 Anywhere'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOffers(offers.filter((_, j) => j !== i))}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>I&apos;m looking for</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={wantInput}
          onChangeText={setWantInput}
          placeholder="e.g. lamp, ride, haircut…"
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addWant}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {wants.map((w, i) => (
        <View key={`w-${i}`} style={styles.chip}>
          <Text style={styles.chipText}>{w}</Text>
          <TouchableOpacity onPress={() => setWants(wants.filter((_, j) => j !== i))}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Saving…' : 'Create profile'}</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: theme.accent,
    fontSize: theme.fontSmall,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  lead: {
    fontSize: theme.fontSmall,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 22,
  },
  title: {
    fontSize: theme.fontTitle,
    fontWeight: '800',
    color: theme.text,
  },
  sub: {
    fontSize: theme.fontBody,
    color: theme.textMuted,
    marginTop: 6,
    lineHeight: 22,
  },
  meta: {
    fontSize: theme.fontSmall,
    color: theme.accent,
    marginTop: 10,
    lineHeight: 20,
  },
  hint: {
    fontSize: theme.fontSmall,
    color: theme.textMuted,
    marginTop: 14,
    lineHeight: 20,
  },
  hero: {
    marginTop: 8,
    gap: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  heroText: {
    flex: 1,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 22,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radiusMd,
    padding: 14,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  inputTall: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingVertical: 8,
  },
  switchText: {
    flex: 1,
  },
  switchHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  radiusBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusBtnText: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '600',
  },
  radiusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    minWidth: 100,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.radiusMd,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  chipText: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
  },
  localBtn: {
    marginRight: 4,
  },
  localTag: {
    fontSize: 12,
    color: theme.textMuted,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  localTagOn: {
    color: theme.accent,
    borderColor: theme.accent,
  },
  remove: {
    color: theme.textMuted,
    fontSize: 16,
    padding: 4,
  },
  submitBtn: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: theme.radiusLg,
    marginTop: 28,
    marginBottom: 40,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

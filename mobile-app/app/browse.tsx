import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMatches } from '@/store/matchesSlice';
import { fetchListings } from '@/store/listingsSlice';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'expo-router';
import { ScreenShell } from '@/components/ScreenShell';
import { theme } from '@/constants/theme';
import { getApiBaseUrl } from '@/constants/api';

const showApiDebug =
  typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export default function BrowseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [debugOpen, setDebugOpen] = useState(false);

  const { myProfile } = useSelector((state: RootState) => state.profile);
  const { matches, loading, error: matchesError } = useSelector((state: RootState) => state.matches);

  useFocusEffect(
    useCallback(() => {
      if (!myProfile?.id) return;
      const id = (myProfile as { id: number }).id;
      dispatch(fetchMatches(id));
      dispatch(fetchListings());
    }, [myProfile, dispatch]),
  );

  if (!myProfile) {
    return (
      <ScreenShell scroll>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No profile yet</Text>
          <Text style={styles.emptyText}>
            Create your profile on the first tab, then come back here for matches.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Finding mutual trades…</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              if (myProfile?.id) {
                dispatch(fetchMatches((myProfile as { id: number }).id));
                dispatch(fetchListings());
              }
            }}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollPad}>
        <Text style={styles.kicker}>Matches</Text>
        <Text style={styles.headline}>People you can trade with</Text>
        <Text style={styles.lead}>
          A match needs both sides: something they offer must pair with something you want, and
          something you offer must pair with something they want. Pull to refresh after changing
          profiles in another tab.
        </Text>

        {matches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No matches yet. Use overlapping words (e.g. you want “haircut”, they offer “haircuts”)
              or include the other person&apos;s offer text in your want line. Both users need at
              least one offer and one want.
            </Text>
          </View>
        ) : (
          matches.map((match: any, i: number) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatarSm}>
                  <Text style={styles.avatarSmText}>
                    {(match.profile?.user_name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.name}>{match.profile?.user_name}</Text>
                  {match.distance_miles != null && (
                    <Text style={styles.distance}>~{match.distance_miles} mi away</Text>
                  )}
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.detail}>
                <Text style={styles.detailLabel}>They offer </Text>
                <Text style={styles.highlight}>{match.they_offer}</Text>
              </Text>
              <Text style={styles.detail}>
                <Text style={styles.detailLabel}>You offer </Text>
                <Text style={styles.highlight}>{match.you_offer}</Text>
              </Text>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() =>
                  router.push({
                    pathname: '/messages',
                    params: {
                      otherProfileId: String(match.profile.id),
                      otherName: match.profile.user_name,
                    },
                  })
                }>
                <Text style={styles.msgBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {showApiDebug && myProfile?.id != null && (
          <View style={styles.debugWrap}>
            <TouchableOpacity
              onPress={() => setDebugOpen((o) => !o)}
              style={styles.debugToggle}
              accessibilityLabel="Toggle API debug">
              <Text style={styles.debugToggleText}>
                API debug {debugOpen ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {debugOpen && (
              <View style={styles.debugBody}>
                <Text style={styles.debugLabel}>Base URL</Text>
                <Text selectable style={styles.debugMono}>
                  {getApiBaseUrl()}
                </Text>
                <Text style={styles.debugLabel}>GET (matches for this profile)</Text>
                <Text selectable style={styles.debugMono}>
                  {`${getApiBaseUrl()}/api/matches/${(myProfile as { id: number }).id}/`}
                </Text>
                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    style={styles.debugLinkBtn}
                    onPress={() => {
                      const u = `${getApiBaseUrl()}/api/matches/${(myProfile as { id: number }).id}/`;
                      if (typeof window !== 'undefined') window.open(u, '_blank', 'noopener,noreferrer');
                    }}>
                    <Text style={styles.debugLinkText}>Open in new tab</Text>
                  </TouchableOpacity>
                )}
                {matchesError ? (
                  <>
                    <Text style={styles.debugLabel}>Last error</Text>
                    <Text selectable style={styles.debugError}>
                      {matchesError}
                    </Text>
                  </>
                ) : null}
                <Text style={styles.debugLabel}>Response JSON ({matches.length} matches)</Text>
                <Text selectable style={styles.debugMono}>
                  {JSON.stringify(matches, null, 2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollPad: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 15,
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
    letterSpacing: -0.5,
  },
  lead: {
    fontSize: theme.fontSmall,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardTitleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  distance: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 14,
  },
  detail: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 6,
    lineHeight: 20,
  },
  detailLabel: {
    color: theme.textMuted,
  },
  highlight: {
    fontWeight: '700',
    color: theme.text,
  },
  msgBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: theme.radiusMd,
    marginTop: 14,
    alignItems: 'center',
  },
  msgBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyWrap: {
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusLg,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 22,
  },
  debugWrap: {
    marginTop: 24,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 16,
  },
  debugToggle: {
    paddingVertical: 8,
  },
  debugToggleText: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  debugBody: {
    marginTop: 8,
    gap: 8,
  },
  debugLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  debugMono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: theme.text,
    lineHeight: 16,
  },
  debugError: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: theme.danger,
    lineHeight: 16,
  },
  debugLinkBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 4,
  },
  debugLinkText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

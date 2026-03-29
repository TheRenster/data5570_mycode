import React from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Platform,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
};

export function ScreenShell({ children, scroll = false, scrollProps }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPad = width >= 768 ? 32 : width >= 480 ? 22 : 16;
  const maxWidth = Math.min(theme.maxContentWidth, width);

  const content = (
    <View
      style={[
        styles.inner,
        {
          paddingHorizontal: horizontalPad,
          maxWidth,
          alignSelf: 'center',
          width: '100%',
        },
      ]}>
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {content}
    </ScrollView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && styles.safeWeb]} edges={['top', 'left', 'right']}>
      <View style={styles.flex}>{body}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  safeWeb: {
    minHeight: '100%' as unknown as number,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

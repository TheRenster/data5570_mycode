import { Stack, Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function Home() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.subtitle}>Here’s what’s going on.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <Text style={styles.cardDescription}>
            View details or explore the app.
          </Text>
          <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
            <Button title="View details" />
          </Link>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Getting started</Text>
          <Text style={styles.cardDescription}>
            Tap the button above to open the details screen. Use the back button to return.
          </Text>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
});

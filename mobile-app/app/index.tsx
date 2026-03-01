import { useState } from 'react';
import { Stack, Link } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { addFavorite, incrementCount } from '@/store/appSlice';
import type { RootState } from '@/store';

export default function Home() {
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const favoriteNames = useSelector((state: RootState) => state.app.favoriteNames);
  const count = useSelector((state: RootState) => state.app.count);

  const handleAddFavorite = () => {
    if (name.trim()) {
      dispatch(addFavorite(name));
      setName('');
    }
  };

  const handleIncrement = () => {
    dispatch(incrementCount());
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.subtitle}>Here's what's going on.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <Text style={styles.cardDescription}>
            Enter a name and view details or add to favorites (stored in Redux).
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Name (useState):</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter a name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.buttonRow}>
            <Link href={{ pathname: '/details', params: { name: name || 'Guest' } }} asChild>
              <Button title="View details" />
            </Link>
            <Button title="Add to favorites" onPress={handleAddFavorite} />
            <Button title="Increment (+1)" onPress={handleIncrement} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>From Redux store</Text>
          <Text style={styles.cardDescription}>Count: {count}</Text>
          <Text style={styles.cardDescription}>
            Favorites: {favoriteNames.length ? favoriteNames.join(', ') : 'None yet'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Getting started</Text>
          <Text style={styles.cardDescription}>
            Use the input above, add favorites, and open details. State is managed with Redux and
            useState.
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
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonRow: {
    gap: 12,
  },
});

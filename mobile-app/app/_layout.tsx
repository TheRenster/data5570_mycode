import { Tabs } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Provider store={store}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} />,
          }}
        />
      </Tabs>
    </Provider>
  );
}

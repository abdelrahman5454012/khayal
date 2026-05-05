import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';

I18nManager.forceRTL(true);

function TabIcon({ name, focused, icon }: { name: string; focused: boolean; icon: string }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{name}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="الرئيسية" focused={focused} icon="🏠" /> }}
      />
      <Tabs.Screen
        name="races"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="السباقات" focused={focused} icon="🏇" /> }}
      />
      <Tabs.Screen
        name="horses"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="خيّال" focused={focused} icon="🐎" /> }}
      />
      <Tabs.Screen
        name="auctions"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="المزادات" focused={focused} icon="⚖️" /> }}
      />
      <Tabs.Screen
        name="bets"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="رهاناتي" focused={focused} icon="💰" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="حسابي" focused={focused} icon="👤" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E1008',
    borderTopColor: '#3D2418',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 18, opacity: 0.45 },
  tabIconActive: { opacity: 1 },
  tabLabel: {
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tabLabelActive: { color: Colors.gold, fontFamily: 'Cairo_600SemiBold' },
});

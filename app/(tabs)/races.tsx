import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { BETTING_RACES, formatCurrencyBet } from '@/constants/betting';

const TABS = ['الكل', 'مفتوح للرهان', 'قريبًا'];

const STATUS_COLOR: Record<string, string> = {
  open:     Colors.successLight,
  upcoming: Colors.gold,
  running:  Colors.live,
  finished: Colors.textMuted,
};
const STATUS_LABEL: Record<string, string> = {
  open:     'مفتوح للرهان',
  upcoming: 'قريبًا',
  running:  'جارٍ',
  finished: 'انتهى',
};

export default function RacesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('الكل');

  const filtered = BETTING_RACES.filter(r => {
    if (activeTab === 'الكل') return true;
    if (activeTab === 'مفتوح للرهان') return r.status === 'open';
    if (activeTab === 'قريبًا') return r.status === 'upcoming';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>السباقات</Text>
        <Text style={styles.subtitle}>جدول السباقات الرسمي — اضغط للرهان</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(race => (
          <TouchableOpacity
            key={race.id}
            style={styles.raceCard}
            onPress={() => router.push(`/race/${race.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: race.image }} style={styles.raceImage} />
            <LinearGradient
              colors={['transparent', 'rgba(26,15,10,0.95)']}
              locations={[0.2, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Status badge */}
            <View style={[styles.statusBadge, { borderColor: STATUS_COLOR[race.status] + '80' }]}>
              {race.status === 'open' && <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[race.status] }]} />}
              <Text style={[styles.statusText, { color: STATUS_COLOR[race.status] }]}>
                {STATUS_LABEL[race.status]}
              </Text>
            </View>

            <View style={styles.raceContent}>
              {/* Top info */}
              <View style={styles.raceTopRow}>
                <View>
                  <Text style={styles.raceDate}>{race.date}</Text>
                  <Text style={styles.raceTime}>{race.startTime}</Text>
                </View>
                <View style={styles.poolBox}>
                  <Text style={styles.poolLabel}>البوتة</Text>
                  <Text style={styles.poolValue}>{formatCurrencyBet(race.totalPool)}</Text>
                </View>
              </View>

              <Text style={styles.raceName}>{race.name}</Text>

              <View style={styles.raceFooter}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>📏 {race.distance}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>🐎 {race.horses.length} خيول</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>📍 {race.venue.split(' ')[0]}</Text>
                </View>
              </View>

              {/* CTA */}
              {race.status === 'open' && (
                <TouchableOpacity
                  style={styles.betCta}
                  onPress={() => router.push(`/race/${race.id}`)}
                >
                  <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.betCtaGrad}>
                    <Text style={styles.betCtaText}>راهن الآن</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl, color: Colors.textPrimary, textAlign: 'right' },
  subtitle: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  tabs: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.md },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tabText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.bg },

  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.md },

  raceCard: {
    borderRadius: Radius.xl, overflow: 'hidden',
    backgroundColor: Colors.bgCard, height: 220,
  },
  raceImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

  statusBadge: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs },

  raceContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  raceTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  raceDate: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold, textAlign: 'right' },
  raceTime: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary },
  poolBox: { alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold },
  poolLabel: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.textSecondary },
  poolValue: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.gold },
  raceName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.sm },
  raceFooter: { flexDirection: 'row-reverse', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.sm },
  metaChip: {
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  metaText: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary },
  betCta: { borderRadius: Radius.md, overflow: 'hidden', alignSelf: 'flex-end' },
  betCtaGrad: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, alignItems: 'center' },
  betCtaText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.sm, color: Colors.bg },
});

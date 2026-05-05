import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import {
  BETTING_RACES, calcOdds, calcWinChance, formatOdds,
  formatCurrencyBet, BettingHorse,
} from '@/constants/betting';

const { width: SW } = Dimensions.get('window');

const STATUS_LABEL: Record<string, string> = {
  open: 'مفتوح للرهان',
  upcoming: 'قريبًا',
  running: 'جارٍ الآن',
  finished: 'انتهى',
};
const STATUS_COLOR: Record<string, string> = {
  open: Colors.successLight,
  upcoming: Colors.gold,
  running: Colors.live,
  finished: Colors.textMuted,
};

// Pulsing bar for live odds
function OddsBar({ chance, color }: { chance: number; color: string }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, { toValue: chance, duration: 700, useNativeDriver: false }).start();
  }, [chance]);
  return (
    <View style={barStyles.track}>
      <Animated.View
        style={[barStyles.fill, { width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: color }]}
      />
    </View>
  );
}
const barStyles = StyleSheet.create({
  track: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});

// Horse row in race detail
function HorseOddsRow({
  horse, totalPool, isSelected, onSelect, rank,
}: {
  horse: BettingHorse;
  totalPool: number;
  isSelected: boolean;
  onSelect: () => void;
  rank: number;
}) {
  const odds = calcOdds(totalPool, horse.totalBetsAmount);
  const chance = calcWinChance(totalPool, horse.totalBetsAmount);

  const rankColors = ['#C6A75E', '#A8A9AD', '#CD7F32', Colors.textMuted, Colors.textMuted];
  const barColors = ['#C6A75E', '#A8A9AD', '#CD7F32', '#6B7280', '#6B7280'];

  return (
    <TouchableOpacity
      style={[styles.horseRow, isSelected && styles.horseRowSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Number badge */}
      <View style={[styles.numberBadge, { borderColor: rankColors[rank] }]}>
        <Text style={[styles.numberText, { color: rankColors[rank] }]}>{horse.number}</Text>
      </View>

      {/* Image */}
      <Image source={{ uri: horse.image }} style={styles.horseThumb} />

      {/* Info */}
      <View style={styles.horseInfo}>
        <Text style={styles.horseName}>{horse.name}</Text>
        <Text style={styles.horseJockey}>🏇 {horse.jockey}</Text>
        <View style={styles.oddsBarRow}>
          <OddsBar chance={chance} color={barColors[rank]} />
          <Text style={styles.chanceText}>{chance}%</Text>
        </View>
      </View>

      {/* Odds */}
      <View style={styles.oddsBox}>
        <Text style={[styles.oddsValue, isSelected && styles.oddsValueSelected]}>
          {formatOdds(odds)}
        </Text>
        <Text style={styles.poolAmount}>{formatCurrencyBet(horse.totalBetsAmount)}</Text>
        {isSelected && (
          <View style={styles.selectedCheck}>
            <Text style={{ color: Colors.bg, fontSize: 10, fontFamily: 'Cairo_700Bold' }}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const race = BETTING_RACES.find(r => r.id === id) ?? BETTING_RACES[0];
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [pool, setPool] = useState(race.totalPool);

  // Simulate pool growing live
  useEffect(() => {
    const interval = setInterval(() => {
      if (race.status === 'open') {
        setPool(prev => prev + Math.floor(Math.random() * 3000));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sortedHorses = [...race.horses].sort((a, b) => b.totalBetsAmount - a.totalBetsAmount);
  const selectedHorse = race.horses.find(h => h.id === selectedHorseId);
  const selectedOdds = selectedHorse ? calcOdds(pool, selectedHorse.totalBetsAmount) : null;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image source={{ uri: race.image }} style={styles.heroImage} />
        <LinearGradient colors={['rgba(26,15,10,0.2)', Colors.bg]} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[race.status] + '25', borderColor: STATUS_COLOR[race.status] }]}>
            {race.status === 'open' && <View style={styles.statusDot} />}
            <Text style={[styles.statusText, { color: STATUS_COLOR[race.status] }]}>{STATUS_LABEL[race.status]}</Text>
          </View>
          <Text style={styles.raceName}>{race.name}</Text>
          <View style={styles.raceMetaRow}>
            <Text style={styles.raceMeta}>📍 {race.venue}</Text>
            <Text style={styles.raceMeta}>📏 {race.distance}</Text>
            <Text style={styles.raceMeta}>⏰ {race.startTime}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Pool card */}
        <View style={styles.poolCard}>
          <View style={styles.poolLeft}>
            <Text style={styles.poolLabel}>إجمالي البوتة</Text>
            <Text style={styles.poolValue}>{formatCurrencyBet(pool)}</Text>
            <Text style={styles.poolSub}>عمولة المنصة: 15%</Text>
          </View>
          <View style={styles.poolDivider} />
          <View style={styles.poolRight}>
            <Text style={styles.poolLabel}>عدد الخيول</Text>
            <Text style={styles.poolValue}>{race.horses.length}</Text>
            <Text style={styles.poolSub}>{race.date} — {race.startTime}</Text>
          </View>
        </View>

        {/* Horses header */}
        <View style={styles.horsesHeader}>
          <Text style={styles.sectionTitle}>اختر جوادك</Text>
          <Text style={styles.oddsNote}>الأوفر حظًا في الأعلى</Text>
        </View>

        {/* Horses list */}
        {sortedHorses.map((horse, idx) => (
          <HorseOddsRow
            key={horse.id}
            horse={horse}
            totalPool={pool}
            isSelected={selectedHorseId === horse.id}
            onSelect={() => setSelectedHorseId(prev => prev === horse.id ? null : horse.id)}
            rank={idx}
          />
        ))}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 كيف تعمل المراهنات؟</Text>
          <Text style={styles.infoText}>
            نظام البوتة المشتركة (Parimutuel): جميع الرهانات تدخل في بوتة واحدة. الفائزون يقتسمون البوتة الصافية بعد خصم عمولة المنصة (15%). كلما قل عدد الراهنين على جوادك، زاد ربحك.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky bottom CTA */}
      {selectedHorse && selectedOdds && (
        <View style={styles.stickyBottom}>
          <View style={styles.stickyInfo}>
            <Text style={styles.stickyHorse}>{selectedHorse.name}</Text>
            <Text style={styles.stickyOdds}>معامل الربح: {formatOdds(selectedOdds)}</Text>
          </View>
          <TouchableOpacity
            style={styles.betBtn}
            onPress={() => router.push({ pathname: `/bet/${race.id}`, params: { horseId: selectedHorse.id } })}
          >
            <LinearGradient colors={[Colors.goldLight, Colors.gold, Colors.goldDark]} style={styles.betBtnGrad}>
              <Text style={styles.betBtnText}>ضع رهانك</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {race.status === 'open' && !selectedHorse && (
        <View style={styles.stickyHint}>
          <Text style={styles.stickyHintText}>👆 اختر جوادًا لوضع رهانك</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  hero: { height: 220, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', top: 52, right: Spacing.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  heroContent: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-end', marginBottom: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.successLight },
  statusText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs },
  raceName: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right' },
  raceMetaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.md, marginTop: 4 },
  raceMeta: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },

  body: { flex: 1 },

  poolCard: {
    flexDirection: 'row-reverse', margin: Spacing.lg,
    backgroundColor: '#2C1F08', borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.gold + '60', padding: Spacing.lg,
  },
  poolLeft: { flex: 1, alignItems: 'flex-end' },
  poolRight: { flex: 1, alignItems: 'flex-end' },
  poolDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
  poolLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  poolValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.gold },
  poolSub: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },

  horsesHeader: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },
  oddsNote: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textMuted },

  horseRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  horseRowSelected: { borderColor: Colors.gold, backgroundColor: '#2C1F08' },
  numberBadge: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  numberText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xs },
  horseThumb: { width: 52, height: 52, borderRadius: 26, flexShrink: 0 },
  horseInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  horseName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  horseJockey: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  oddsBarRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, width: '100%' },
  chanceText: { fontFamily: 'Cairo_600SemiBold', fontSize: 10, color: Colors.textMuted, minWidth: 28, textAlign: 'right' },

  oddsBox: { alignItems: 'center', minWidth: 60, position: 'relative' },
  oddsValue: {
    fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textSecondary,
  },
  oddsValueSelected: { color: Colors.gold },
  poolAmount: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  selectedCheck: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },

  infoBox: {
    margin: Spacing.lg, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.gold, textAlign: 'right', marginBottom: 6 },
  infoText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', lineHeight: 20 },

  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: 24,
  },
  stickyInfo: { flex: 1, alignItems: 'flex-end' },
  stickyHorse: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  stickyOdds: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold },
  betBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  betBtnGrad: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md + 2, alignItems: 'center' },
  betBtnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },

  stickyHint: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    alignItems: 'center', paddingVertical: Spacing.md, paddingBottom: 24,
  },
  stickyHintText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.md, color: Colors.textSecondary },
});

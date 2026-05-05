import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { BETTING_RACES } from '@/constants/betting';

const { width: SW } = Dimensions.get('window');
const TRACK_WIDTH = SW - Spacing.lg * 2;

function useRaceSimulation(horseCount: number) {
  const [positions, setPositions] = useState(() =>
    Array.from({ length: horseCount }, (_, i) => ({
      id: i,
      progress: Math.random() * 0.1,
      speed: 0.008 + Math.random() * 0.006,
      finished: false,
      finishRank: 0,
    }))
  );
  const [finishedCount, setFinishedCount] = useState(0);
  const [raceEnded, setRaceEnded] = useState(false);
  const finishedRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => {
        const next = prev.map(p => {
          if (p.finished) return p;
          const burst = Math.random() < 0.05 ? 0.015 : 0;
          const newProgress = Math.min(1, p.progress + p.speed + burst);
          if (newProgress >= 1 && !p.finished) {
            finishedRef.current += 1;
            setFinishedCount(finishedRef.current);
            if (finishedRef.current >= prev.length) setRaceEnded(true);
            return { ...p, progress: 1, finished: true, finishRank: finishedRef.current };
          }
          return { ...p, progress: newProgress };
        });
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...positions].sort((a, b) => b.progress - a.progress);
  return { positions, sorted, raceEnded };
}

const HORSE_COLORS = ['#C6A75E', '#A8A9AD', '#CD7F32', '#6B7280', '#8B5CF6'];

export default function LiveRaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const race = BETTING_RACES.find(r => r.id === id) ?? BETTING_RACES[0];
  const { positions, sorted, raceEnded } = useRaceSimulation(race.horses.length);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {!raceEnded && (
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          )}
          <Text style={styles.headerTitle}>{raceEnded ? '🏁 انتهى السباق' : '🔴 مباشر'}</Text>
        </View>
        <Text style={styles.timer}>{pad(mins)}:{pad(secs)}</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Race name + venue */}
        <View style={styles.raceInfo}>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.raceVenue}>📍 {race.venue} • {race.distance}</Text>
        </View>

        {/* Track visualization */}
        <View style={styles.trackContainer}>
          <Text style={styles.trackLabel}>📍 البداية</Text>
          <Text style={styles.trackLabelEnd}>🏁 النهاية</Text>
          {race.horses.map((horse, idx) => {
            const pos = positions[idx];
            const rankInRace = sorted.findIndex(p => p.id === idx);
            const color = HORSE_COLORS[Math.min(idx, HORSE_COLORS.length - 1)];
            const dotLeft = pos.progress * (TRACK_WIDTH - 32);

            return (
              <View key={horse.id} style={styles.lane}>
                <View style={styles.laneTrack}>
                  <View style={[styles.laneBar, { width: TRACK_WIDTH }]} />
                  <Animated.View
                    style={[
                      styles.horseDot,
                      {
                        backgroundColor: color,
                        left: dotLeft,
                        borderWidth: pos.finished ? 2 : 0,
                        borderColor: '#fff',
                      },
                    ]}
                  >
                    <Text style={styles.horseDotNum}>{horse.number}</Text>
                  </Animated.View>
                </View>
                <View style={styles.laneInfo}>
                  <Text style={[styles.laneRank, { color: rankInRace === 0 ? Colors.gold : Colors.textMuted }]}>
                    {pos.finished ? `#${pos.finishRank}` : `#${rankInRace + 1}`}
                  </Text>
                  <Text style={styles.laneName} numberOfLines={1}>{horse.name}</Text>
                </View>
              </View>
            );
          })}
          {/* Finish line */}
          <View style={[styles.finishLine, { left: TRACK_WIDTH - 2 + 88 }]} />
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{raceEnded ? '🏆 النتائج النهائية' : '📊 الترتيب الحالي'}</Text>
          {sorted.map((pos, rank) => {
            const horse = race.horses[pos.id];
            const color = HORSE_COLORS[Math.min(pos.id, HORSE_COLORS.length - 1)];
            const pct = Math.round(pos.progress * 100);
            return (
              <View
                key={pos.id}
                style={[styles.leaderRow, rank === 0 && styles.leaderRowFirst]}
              >
                <View style={[styles.rankBadge, rank === 0 && styles.rankBadgeFirst]}>
                  <Text style={[styles.rankNum, rank === 0 && { color: Colors.bg }]}>
                    {pos.finished ? pos.finishRank : rank + 1}
                  </Text>
                </View>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={[styles.leaderName, rank === 0 && { color: Colors.gold }]}>{horse.name}</Text>
                <Text style={styles.leaderJockey}>{horse.jockey}</Text>
                <View style={styles.leaderProgress}>
                  <View style={[styles.leaderBar, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.leaderPct, { color }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        {/* My bet status */}
        <View style={styles.myBetCard}>
          <Text style={styles.myBetTitle}>رهانك في هذا السباق</Text>
          <View style={styles.myBetRow}>
            <View style={styles.myBetLeft}>
              <Text style={styles.myBetHorse}>الجواد شاهين</Text>
              <Text style={styles.myBetMeta}>5,000 ج.م • ربح محتمل: 13,500 ج.م</Text>
            </View>
            <View style={[styles.myBetStatus,
              { backgroundColor: sorted[0]?.id === 0 ? Colors.success + '30' : Colors.danger + '30' }
            ]}>
              <Text style={[styles.myBetStatusText,
                { color: sorted[0]?.id === 0 ? Colors.successLight : Colors.live }
              ]}>
                {sorted[0]?.id === 0 ? '🏆 في المقدمة!' : `#${sorted.findIndex(p => p.id === 0) + 1}`}
              </Text>
            </View>
          </View>
        </View>

        {raceEnded && (
          <View style={styles.finalBanner}>
            <LinearGradient colors={['#2C1F08', '#1A1200']} style={styles.finalGrad}>
              <Text style={styles.finalTitle}>🏁 انتهى السباق!</Text>
              <Text style={styles.finalWinner}>
                الفائز: {race.horses[sorted[0]?.id ?? 0]?.name}
              </Text>
              <TouchableOpacity style={styles.finalBtn} onPress={() => router.replace('/bets')}>
                <Text style={styles.finalBtnText}>عرض نتائج رهاناتي</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerCenter: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.live },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  timer: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.gold, letterSpacing: 1 },

  raceInfo: { padding: Spacing.lg, alignItems: 'flex-end' },
  raceName: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary },
  raceVenue: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },

  trackContainer: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    position: 'relative',
  },
  trackLabel: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.textMuted, textAlign: 'right', marginBottom: 4 },
  trackLabelEnd: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.gold, position: 'absolute', left: Spacing.md, top: Spacing.md },

  lane: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  laneTrack: { width: TRACK_WIDTH, height: 28, position: 'relative', justifyContent: 'center' },
  laneBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, position: 'absolute' },
  horseDot: {
    position: 'absolute', width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', top: 0,
  },
  horseDotNum: { fontFamily: 'Cairo_900Black', fontSize: 10, color: '#fff' },
  laneInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, minWidth: 80, flexShrink: 0 },
  laneRank: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xs, minWidth: 24 },
  laneName: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary, flex: 1 },
  finishLine: { position: 'absolute', top: 32, bottom: 8, width: 2, backgroundColor: Colors.gold + '80' },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },

  leaderRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  leaderRowFirst: { borderColor: Colors.gold, backgroundColor: '#2C1F08' },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bgElevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  rankBadgeFirst: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  rankNum: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xs, color: Colors.textPrimary },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  leaderName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textPrimary, flex: 1 },
  leaderJockey: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },
  leaderProgress: { width: 60, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  leaderBar: { height: '100%', borderRadius: 2 },
  leaderPct: { fontFamily: 'Cairo_700Bold', fontSize: 10, minWidth: 30, textAlign: 'right' },

  myBetCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderGold,
  },
  myBetTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm },
  myBetRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  myBetLeft: { alignItems: 'flex-end' },
  myBetHorse: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },
  myBetMeta: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  myBetStatus: { borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  myBetStatusText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md },

  finalBanner: { marginHorizontal: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden' },
  finalGrad: { padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
  finalTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, marginBottom: 4 },
  finalWinner: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.gold, marginBottom: Spacing.lg },
  finalBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.sm,
  },
  finalBtnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },
});

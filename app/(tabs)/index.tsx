import { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Image, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { LIVE_AUCTIONS, UPCOMING_RACES, ACTIVE_AUCTIONS, TOP_HORSES, formatCurrency } from '@/constants/data';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - Spacing.lg * 2;

// ── Live dot ──────────────────────────────────────────────
function LiveDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, { opacity: anim }]} />
      <Text style={styles.liveText}>مباشر</Text>
    </View>
  );
}

// ── Countdown ─────────────────────────────────────────────
function Countdown({ h, m, s }: { h: number; m: number; s: number }) {
  const [time, setTime] = useState({ h, m, s });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={styles.countdown}>
      <View style={styles.timeUnit}>
        <Text style={styles.timeNumber}>{pad(time.h)}</Text>
        <Text style={styles.timeLabel}>ساعة</Text>
      </View>
      <Text style={styles.timeSep}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={styles.timeNumber}>{pad(time.m)}</Text>
        <Text style={styles.timeLabel}>دقيقة</Text>
      </View>
      <Text style={styles.timeSep}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={styles.timeNumber}>{pad(time.s)}</Text>
        <Text style={styles.timeLabel}>ثانية</Text>
      </View>
    </View>
  );
}

// ── Hero Auction Card ──────────────────────────────────────
function HeroCard({ item }: { item: typeof LIVE_AUCTIONS[0] }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/auction/${item.id}`)}
      style={[styles.heroCard, { width: CARD_W }]}
    >
      <Image source={{ uri: item.image }} style={styles.heroImage} />
      <LinearGradient
        colors={['transparent', 'rgba(26,15,10,0.7)', Colors.bg]}
        locations={[0.2, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LiveDot />
      <View style={styles.heroContent}>
        <Text style={styles.auctionNo}>مزاد رقم {item.auctionNumber}</Text>
        <Text style={styles.heroName}>{item.name}</Text>
        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
        <Text style={styles.bidLabel}>أعلى مزايد حالي</Text>
        <Text style={styles.bidAmount}>{formatCurrency(item.currentBid)}</Text>
        <Text style={styles.endLabel}>ينتهي المزاد خلال</Text>
        <Countdown {...item.timeLeft} />
        <TouchableOpacity
          style={styles.enterBtn}
          onPress={() => router.push(`/auction/${item.id}`)}
        >
          <Text style={styles.enterBtnText}>ادخل المزاد الآن</Text>
          <Text style={styles.enterBtnArrow}>‹</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Category Pills ─────────────────────────────────────────
const CATEGORIES = [
  { id: '1', icon: '⚖️', label: 'مزادات مباشرة' },
  { id: '2', icon: '🐎', label: 'جميع الخيل' },
  { id: '3', icon: '🏆', label: 'السباقات' },
  { id: '4', icon: '💰', label: 'الرهانات' },
  { id: '5', icon: '📅', label: 'جدول السباقات' },
];

// ── Race Card ──────────────────────────────────────────────
function RaceCard({ item }: { item: typeof UPCOMING_RACES[0] }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.raceCard}
      onPress={() => router.push('/races')}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.raceImage} />
      <LinearGradient
        colors={['transparent', 'rgba(26,15,10,0.85)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.raceContent}>
        <Text style={styles.raceDate}>{item.date}</Text>
        <Text style={styles.raceTime}>{item.time}</Text>
        <Text style={styles.raceName}>{item.name}</Text>
        <View style={styles.raceFooter}>
          <Text style={styles.raceVenue}>📍 {item.venue}</Text>
          <View style={styles.raceHorsesRow}>
            <Text style={styles.raceHorsesCount}>{item.horsesCount} جواد</Text>
            <Text>🐎</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Live Auction Card ──────────────────────────────────────
function AuctionCard({ item }: { item: typeof ACTIVE_AUCTIONS[0] }) {
  const router = useRouter();
  const [fav, setFav] = useState(item.isFavorite);
  return (
    <TouchableOpacity
      style={styles.auctionCard}
      onPress={() => router.push(`/auction/${item.id}`)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.auctionImage} />
      <TouchableOpacity style={styles.favBtn} onPress={() => setFav(!fav)}>
        <Text style={{ fontSize: 16 }}>{fav ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <View style={styles.auctionLiveBadge}>
        <View style={styles.auctionLiveDot} />
        <Text style={styles.auctionLiveText}>مباشر</Text>
      </View>
      <View style={styles.auctionBody}>
        <Text style={styles.auctionName}>{item.name}</Text>
        <Text style={styles.auctionBidLabel}>أعلى مزايد</Text>
        <Text style={styles.auctionBid}>{formatCurrency(item.currentBid)}</Text>
        <View style={styles.auctionTimerRow}>
          <Text style={styles.auctionTimerIcon}>⏱</Text>
          <Text style={styles.auctionTimer}>{item.timeLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Top Horse Card ─────────────────────────────────────────
function TopHorseCard({ item }: { item: typeof TOP_HORSES[0] }) {
  const rankColors: Record<number, string> = {
    1: Colors.gold,
    2: '#A8A9AD',
    3: '#CD7F32',
  };
  const isFirst = item.rank === 1;
  return (
    <View style={[styles.topCard, isFirst && styles.topCardFirst]}>
      <View style={[styles.rankBadge, { backgroundColor: rankColors[item.rank] }]}>
        <Text style={styles.rankNum}>{item.rank}</Text>
      </View>
      <View style={[styles.horseAvatarWrap, isFirst && styles.horseAvatarWrapFirst]}>
        <Image source={{ uri: item.image }} style={styles.horseAvatar} />
      </View>
      <Text style={[styles.topName, isFirst && styles.topNameFirst]}>{item.name}</Text>
      <Text style={[styles.topRating, isFirst && styles.topRatingFirst]}>
        التصنيف: {item.rating}
      </Text>
    </View>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.seeAllBtn}>
          <Text style={styles.seeAll}>عرض الكل</Text>
          <Text style={styles.seeAllArrow}>‹</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Text style={styles.logoAr}>خيّال</Text>
          <Text style={styles.logoSub}>المنصة الرسمية للخيل في مصر</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/search')}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Hero Carousel */}
        <Animated.FlatList
          data={LIVE_AUCTIONS}
          keyExtractor={i => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + Spacing.md}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          renderItem={({ item }) => <HeroCard item={item} />}
        />

        {/* Pagination dots */}
        <View style={styles.dots}>
          {LIVE_AUCTIONS.map((_, i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.catItem}>
              <View style={styles.catIcon}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Races */}
        <View style={styles.section}>
          <SectionHeader title="السباقات القادمة" onPress={() => router.push('/races')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {UPCOMING_RACES.map(r => <RaceCard key={r.id} item={r} />)}
          </ScrollView>
        </View>

        {/* Live Auctions */}
        <View style={styles.section}>
          <SectionHeader title="المزادات المباشرة" onPress={() => router.push('/auctions')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {ACTIVE_AUCTIONS.map(a => <AuctionCard key={a.id} item={a} />)}
          </ScrollView>
        </View>

        {/* Top Ranked */}
        <View style={styles.section}>
          <SectionHeader title="أعلى الخيل تصنيفًا" onPress={() => router.push('/horses')} />
          <View style={styles.topRow}>
            {TOP_HORSES.map(h => <TopHorseCard key={h.id} item={h} />)}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const RACE_CARD_W = 170;
const AUCTION_CARD_W = 160;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  // Header
  appHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 52,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bg,
  },
  logoWrap: { alignItems: 'center' },
  logoAr: {
    fontFamily: 'Cairo_900Black',
    fontSize: 26,
    color: Colors.gold,
    letterSpacing: 1,
  },
  logoSub: {
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 22 },
  notifBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.live, borderRadius: 10,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontFamily: 'Cairo_700Bold', fontSize: 9, color: '#fff' },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Hero Card
  heroCard: {
    height: 320, borderRadius: Radius.xl, overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  liveBadge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs, color: '#fff' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  auctionNo: {
    fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm,
    color: Colors.textSecondary, textAlign: 'right',
  },
  heroName: {
    fontFamily: 'Cairo_900Black', fontSize: 28,
    color: Colors.textPrimary, textAlign: 'right', lineHeight: 40,
  },
  heroSubtitle: {
    fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm,
    color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm,
  },
  bidLabel: {
    fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm,
    color: Colors.textSecondary, textAlign: 'right',
  },
  bidAmount: {
    fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl,
    color: Colors.gold, textAlign: 'right',
  },
  endLabel: {
    fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs,
    color: Colors.textSecondary, textAlign: 'right', marginTop: 4,
  },
  countdown: {
    flexDirection: 'row-reverse', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  timeUnit: {
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  timeNumber: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },
  timeLabel: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.textSecondary },
  timeSep: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xl, color: Colors.gold },
  enterBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.sm, gap: 8,
  },
  enterBtnText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  enterBtnArrow: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: Colors.textPrimary },

  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.gold },

  // Categories
  categories: { paddingHorizontal: Spacing.lg, gap: Spacing.xl, paddingVertical: Spacing.lg },
  catItem: { alignItems: 'center', gap: 6, width: 70 },
  catIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  catLabel: {
    fontFamily: 'Cairo_400Regular', fontSize: 11,
    color: Colors.textSecondary, textAlign: 'center',
  },

  // Section
  section: { marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.gold },
  seeAllArrow: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: Colors.gold },
  hScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  // Race Card
  raceCard: {
    width: RACE_CARD_W, height: 160, borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  raceImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  raceContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md },
  raceDate: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold },
  raceTime: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary },
  raceName: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  raceFooter: { marginTop: 2 },
  raceVenue: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'right' },
  raceHorsesRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  raceHorsesCount: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary },

  // Auction Card
  auctionCard: {
    width: AUCTION_CARD_W, borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  auctionImage: { width: '100%', height: 130 },
  favBtn: { position: 'absolute', top: 8, right: 8 },
  auctionLiveBadge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  auctionLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  auctionLiveText: { fontFamily: 'Cairo_700Bold', fontSize: 9, color: '#fff' },
  auctionBody: { padding: Spacing.md },
  auctionName: {
    fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm,
    color: Colors.textPrimary, textAlign: 'right',
  },
  auctionBidLabel: {
    fontFamily: 'Cairo_400Regular', fontSize: 10,
    color: Colors.textSecondary, textAlign: 'right',
  },
  auctionBid: {
    fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm,
    color: Colors.gold, textAlign: 'right',
  },
  auctionTimerRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgElevated, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4, marginTop: 6,
  },
  auctionTimerIcon: { fontSize: 11 },
  auctionTimer: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary },

  // Top Horses
  topRow: { flexDirection: 'row-reverse', paddingHorizontal: Spacing.lg, gap: Spacing.md, alignItems: 'flex-end' },
  topCard: {
    flex: 1, borderRadius: Radius.lg, backgroundColor: Colors.bgCard,
    alignItems: 'center', padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  topCardFirst: {
    backgroundColor: '#2C1F08', borderColor: Colors.gold,
    paddingTop: Spacing.xl,
  },
  rankBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  rankNum: { fontFamily: 'Cairo_900Black', fontSize: FontSize.sm, color: '#fff' },
  horseAvatarWrap: {
    width: 64, height: 64, borderRadius: 32, overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.border, marginBottom: 6,
  },
  horseAvatarWrapFirst: { width: 80, height: 80, borderRadius: 40, borderColor: Colors.gold },
  horseAvatar: { width: '100%', height: '100%' },
  topName: {
    fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs,
    color: Colors.textPrimary, textAlign: 'center',
  },
  topNameFirst: { fontSize: FontSize.sm, color: Colors.gold },
  topRating: {
    fontFamily: 'Cairo_400Regular', fontSize: 10,
    color: Colors.textSecondary, textAlign: 'center',
  },
  topRatingFirst: { color: Colors.goldLight },
});

import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { LIVE_AUCTIONS, ACTIVE_AUCTIONS, formatCurrency } from '@/constants/data';

const TABS = ['الكل', 'مباشر', 'قادم', 'منتهي'];

export default function AuctionsScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>المزادات</Text>
        <Text style={styles.subtitle}>مزادات الخيول الرسمية</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={i} style={[styles.tab, i === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {/* Featured live auction */}
        {LIVE_AUCTIONS.map(auction => (
          <TouchableOpacity
            key={auction.id}
            style={styles.featuredCard}
            onPress={() => router.push(`/auction/${auction.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: auction.image }} style={styles.featuredImage} />
            <LinearGradient
              colors={['transparent', 'rgba(26,15,10,0.95)']}
              locations={[0.3, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.featuredLive}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>مباشر</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.auctionNo}>مزاد رقم {auction.auctionNumber}</Text>
              <Text style={styles.auctionName}>{auction.name}</Text>
              <View style={styles.featuredRow}>
                <View style={styles.bidBox}>
                  <Text style={styles.bidLabel}>أعلى مزايد</Text>
                  <Text style={styles.bidAmount}>{formatCurrency(auction.currentBid)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.enterBtn}
                  onPress={() => router.push(`/auction/${auction.id}`)}
                >
                  <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.enterGrad}>
                    <Text style={styles.enterBtnText}>ادخل الآن</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Other active auctions */}
        {ACTIVE_AUCTIONS.map(auction => (
          <TouchableOpacity
            key={auction.id}
            style={styles.auctionCard}
            onPress={() => router.push(`/auction/${auction.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: auction.image }} style={styles.auctionImage} />
            <View style={styles.auctionCardLive}>
              <View style={styles.liveDotSm} />
              <Text style={styles.liveTxtSm}>مباشر</Text>
            </View>
            <View style={styles.auctionBody}>
              <Text style={styles.auctionCardName}>{auction.name}</Text>
              <Text style={styles.auctionBidLabel}>أعلى مزايد</Text>
              <Text style={styles.auctionBid}>{formatCurrency(auction.currentBid)}</Text>
              <View style={styles.timerRow}>
                <Text style={styles.timerIcon}>⏱</Text>
                <Text style={styles.timerText}>{auction.timeLeft}</Text>
              </View>
            </View>
            <View style={styles.auctionArrow}>
              <Text style={styles.arrowText}>‹</Text>
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

  list: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  featuredCard: {
    height: 220, borderRadius: Radius.xl, overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredLive: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveTxt: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs, color: '#fff' },
  featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  auctionNo: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  auctionName: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.sm },
  featuredRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  bidBox: { alignItems: 'flex-end' },
  bidLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  bidAmount: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.gold },
  enterBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  enterGrad: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, alignItems: 'center' },
  enterBtnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },

  auctionCard: {
    flexDirection: 'row-reverse', backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  auctionImage: { width: 100, height: 90 },
  auctionCardLive: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveDotSm: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  liveTxtSm: { fontFamily: 'Cairo_700Bold', fontSize: 9, color: '#fff' },
  auctionBody: { flex: 1, padding: Spacing.md, alignItems: 'flex-end' },
  auctionCardName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  auctionBidLabel: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary },
  auctionBid: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.gold },
  timerRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgElevated, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  timerIcon: { fontSize: 11 },
  timerText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.textSecondary },
  auctionArrow: { paddingRight: Spacing.md },
  arrowText: { fontSize: 22, color: Colors.textMuted },
});

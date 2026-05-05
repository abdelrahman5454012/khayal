import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Image, Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { LIVE_AUCTIONS, BID_HISTORY, formatCurrency } from '@/constants/data';

const { width: SW } = Dimensions.get('window');

const QUICK_INCREMENTS = [5000, 10000, 20000, 50000];

function GoldFlash({ trigger }: { trigger: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trigger === 0) return;
    anim.setValue(1);
    Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }).start();
  }, [trigger]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: anim, backgroundColor: Colors.gold + '30', zIndex: 10 }]}
    />
  );
}

export default function AuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const auction = LIVE_AUCTIONS.find(a => a.id === id) ?? LIVE_AUCTIONS[0];

  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [customBid, setCustomBid] = useState('');
  const [bidHistory, setBidHistory] = useState(BID_HISTORY);
  const [isHighestBidder, setIsHighestBidder] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [timeLeft, setTimeLeft] = useState(auction.timeLeft.h * 3600 + auction.timeLeft.m * 60 + auction.timeLeft.s);
  const [isUrgent, setIsUrgent] = useState(false);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1);
        setIsUrgent(next <= 30);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  function placeBid(amount: number) {
    const minBid = currentBid + 5000;
    if (amount < minBid) {
      Alert.alert('مزايدة غير صالحة', `الحد الأدنى للمزايدة هو ${formatCurrency(minBid)}`);
      return;
    }
    setCurrentBid(amount);
    setIsHighestBidder(true);
    setFlashTrigger(prev => prev + 1);
    const now = new Date();
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setBidHistory(prev => [
      { id: String(Date.now()), bidder: 'أنت', amount, time: timeStr, isHighest: true },
      ...prev.map(b => ({ ...b, isHighest: false })),
    ]);
    setCustomBid('');
  }

  function handleQuickBid(increment: number) {
    placeBid(currentBid + increment);
  }

  function handleCustomBid() {
    const amount = parseInt(customBid.replace(/,/g, ''), 10);
    if (isNaN(amount)) {
      Alert.alert('خطأ', 'أدخل مبلغًا صحيحًا');
      return;
    }
    placeBid(amount);
  }

  const timerBg = isUrgent ? Colors.danger : Colors.bgCard;
  const timerBorder = isUrgent ? Colors.live : Colors.borderGold;

  return (
    <View style={styles.container}>
      <GoldFlash trigger={flashTrigger} />

      {/* Horse Image Header */}
      <View style={styles.header}>
        <Image source={{ uri: auction.image }} style={styles.headerImage} />
        <LinearGradient
          colors={['rgba(26,15,10,0.3)', Colors.bg]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>مباشر</Text>
          </View>
          <Text style={styles.auctionNoTxt}>مزاد رقم {auction.auctionNumber}</Text>
          <Text style={styles.horseName}>{auction.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Current Bid + Timer */}
        <View style={styles.bidPanel}>
          <View style={styles.currentBidBox}>
            <Text style={styles.currentBidLabel}>أعلى مزايد حالي</Text>
            <Text style={styles.currentBidAmount}>{formatCurrency(currentBid)}</Text>
            <Text style={styles.nextBidHint}>
              الحد الأدنى للمزايدة التالية: {formatCurrency(currentBid + 5000)}
            </Text>
          </View>
          <View style={[styles.timerBox, { backgroundColor: timerBg, borderColor: timerBorder }]}>
            <Text style={styles.timerLabel}>ينتهي خلال</Text>
            <Text style={[styles.timerValue, isUrgent && styles.timerUrgent]}>
              {pad(h)}:{pad(m)}:{pad(s)}
            </Text>
            {isUrgent && <Text style={styles.urgentNote}>⚠️ سيتمدد تلقائيًا</Text>}
          </View>
        </View>

        {/* Status Banner */}
        {isHighestBidder ? (
          <View style={[styles.statusBanner, styles.statusSuccess]}>
            <Text style={styles.statusIcon}>🏆</Text>
            <Text style={styles.statusText}>أنت أعلى مزايد الآن!</Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, styles.statusDanger]}>
            <Text style={styles.statusIcon}>⚡</Text>
            <Text style={styles.statusText}>تم تجاوز عرضك — زايد الآن</Text>
          </View>
        )}

        {/* Quick Bid Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مزايدة سريعة</Text>
          <View style={styles.quickBids}>
            {QUICK_INCREMENTS.map(inc => (
              <TouchableOpacity
                key={inc}
                style={styles.quickBtn}
                onPress={() => handleQuickBid(inc)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickBtnText}>+{(inc / 1000).toFixed(0)}K</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Bid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مبلغ مخصص</Text>
          <View style={styles.customBidRow}>
            <TextInput
              style={styles.customInput}
              value={customBid}
              onChangeText={setCustomBid}
              placeholder={`مثال: ${(currentBid + 15000).toLocaleString('ar-EG')}`}
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              textAlign="right"
            />
            <TouchableOpacity style={styles.bidConfirmBtn} onPress={handleCustomBid}>
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
                style={styles.bidConfirmGradient}
              >
                <Text style={styles.bidConfirmText}>زايد</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bid History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل المزايدات</Text>
          <View style={styles.historyList}>
            {bidHistory.map((bid, idx) => (
              <View
                key={bid.id}
                style={[styles.historyRow, bid.isHighest && styles.historyRowTop, idx === 0 && styles.historyRowFirst]}
              >
                <View style={styles.historyLeft}>
                  {bid.isHighest && <Text style={styles.crownIcon}>👑</Text>}
                  <Text style={[styles.historyAmount, bid.isHighest && styles.historyAmountTop]}>
                    {formatCurrency(bid.amount)}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyBidder}>{bid.bidder}</Text>
                  <Text style={styles.historyTime}>{bid.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Escrow Note */}
        <View style={styles.escrowNote}>
          <Text style={styles.escrowIcon}>🔐</Text>
          <Text style={styles.escrowText}>
            المبالغ محفوظة في نظام الضمان — تُحرَّر بعد التحقق من البيع
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: { height: 240, position: 'relative', overflow: 'hidden' },
  headerImage: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', top: 52, right: Spacing.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerContent: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-end', marginBottom: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveTxt: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs, color: '#fff' },
  auctionNoTxt: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  horseName: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right' },

  // Body
  body: { flex: 1 },

  // Bid Panel
  bidPanel: { flexDirection: 'row-reverse', gap: Spacing.md, margin: Spacing.lg },
  currentBidBox: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold,
    alignItems: 'flex-end',
  },
  currentBidLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  currentBidAmount: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.gold },
  nextBidHint: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'right' },
  timerBox: {
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, minWidth: 100,
  },
  timerLabel: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary },
  timerValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary, letterSpacing: 1 },
  timerUrgent: { color: Colors.live },
  urgentNote: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.live, marginTop: 2 },

  // Status
  statusBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md,
  },
  statusSuccess: { backgroundColor: Colors.success + '30', borderWidth: 1, borderColor: Colors.success },
  statusDanger: { backgroundColor: Colors.danger + '30', borderWidth: 1, borderColor: Colors.danger },
  statusIcon: { fontSize: 18 },
  statusText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },

  // Quick Bids
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold', fontSize: FontSize.md,
    color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md,
  },
  quickBids: { flexDirection: 'row-reverse', gap: Spacing.md },
  quickBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.gold },

  // Custom Bid
  customBidRow: { flexDirection: 'row-reverse', gap: Spacing.md, alignItems: 'center' },
  customInput: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, fontFamily: 'Cairo_400Regular',
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  bidConfirmBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  bidConfirmGradient: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md + 2, alignItems: 'center' },
  bidConfirmText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },

  // History
  historyList: { gap: Spacing.sm },
  historyRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  historyRowTop: { borderColor: Colors.gold, backgroundColor: '#2C1F08' },
  historyRowFirst: {},
  historyLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  crownIcon: { fontSize: 14 },
  historyAmount: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textSecondary },
  historyAmountTop: { color: Colors.gold, fontSize: FontSize.lg },
  historyRight: { alignItems: 'flex-start' },
  historyBidder: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary },
  historyTime: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },

  // Escrow
  escrowNote: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  escrowIcon: { fontSize: 18 },
  escrowText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
});

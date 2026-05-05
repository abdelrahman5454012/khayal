import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Image, Animated, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import {
  BETTING_RACES, calcOdds, calcPayout, formatOdds,
  formatCurrencyBet, COMMISSION_RATE,
} from '@/constants/betting';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];
const WALLET_BALANCE = 85000;

function SuccessModal({ visible, payout, horse, onClose }: {
  visible: boolean; payout: number; horse: string; onClose: () => void;
}) {
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.card, { transform: [{ scale }] }]}>
          <Text style={modalStyles.emoji}>🎉</Text>
          <Text style={modalStyles.title}>تم وضع رهانك!</Text>
          <Text style={modalStyles.horse}>{horse}</Text>
          <View style={modalStyles.payoutBox}>
            <Text style={modalStyles.payoutLabel}>ربحك المحتمل</Text>
            <Text style={modalStyles.payoutValue}>{formatCurrencyBet(payout)}</Text>
          </View>
          <Text style={modalStyles.note}>
            ستُخطَر بنتيجة السباق فور انتهائه
          </Text>
          <TouchableOpacity style={modalStyles.btn} onPress={onClose}>
            <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={modalStyles.btnGrad}>
              <Text style={modalStyles.btnText}>رائع!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xxl, padding: Spacing.xxxl,
    width: '82%', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold,
  },
  emoji: { fontSize: 56, marginBottom: Spacing.md },
  title: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, marginBottom: 4 },
  horse: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.md, color: Colors.gold, marginBottom: Spacing.lg },
  payoutBox: {
    backgroundColor: '#2C1F08', borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', width: '100%', marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.gold + '60',
  },
  payoutLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  payoutValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl, color: Colors.gold },
  note: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  btn: { borderRadius: Radius.lg, overflow: 'hidden', width: '100%' },
  btnGrad: { paddingVertical: Spacing.md, alignItems: 'center' },
  btnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },
});

export default function PlaceBetScreen() {
  const { raceId, horseId } = useLocalSearchParams<{ raceId: string; horseId: string }>();
  const router = useRouter();

  const race = BETTING_RACES.find(r => r.id === raceId) ?? BETTING_RACES[0];
  const horse = race.horses.find(h => h.id === horseId) ?? race.horses[0];

  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedPayout, setConfirmedPayout] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const numAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const odds = calcOdds(race.totalPool, horse.totalBetsAmount);
  const payout = numAmount > 0 ? calcPayout(numAmount, race.totalPool, horse.totalBetsAmount) : 0;
  const profit = payout - numAmount;
  const overBalance = numAmount > WALLET_BALANCE;
  const tooLow = numAmount > 0 && numAmount < 100;
  const canBet = numAmount >= 100 && !overBalance && agreedToTerms;

  function handleQuick(val: number) {
    setAmount(val.toLocaleString('ar-EG'));
  }

  function handleConfirm() {
    if (!canBet) return;
    setConfirmedPayout(payout);
    setShowSuccess(true);
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    router.replace('/bets');
  }

  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (numAmount > 0) {
      Animated.spring(glowAnim, { toValue: 1, useNativeDriver: true, tension: 60 }).start();
    } else {
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [numAmount > 0]);

  return (
    <View style={styles.container}>
      <SuccessModal visible={showSuccess} payout={confirmedPayout} horse={horse.name} onClose={handleSuccessClose} />

      {/* Header */}
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>وضع رهان</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        {/* Selected horse card */}
        <View style={styles.horseCard}>
          <Image source={{ uri: horse.image }} style={styles.horseImage} />
          <View style={styles.horseCardBody}>
            <View style={styles.horseCardTop}>
              <View style={styles.horseBadge}>
                <Text style={styles.horseBadgeText}>#{horse.number}</Text>
              </View>
              <Text style={styles.horseCardName}>{horse.name}</Text>
            </View>
            <Text style={styles.horseCardJockey}>🏇 {horse.jockey} — {horse.stable}</Text>
            <Text style={styles.raceLabel}>{race.name} • {race.date} {race.startTime}</Text>
          </View>
          <View style={styles.oddsTag}>
            <Text style={styles.oddsTagLabel}>معامل</Text>
            <Text style={styles.oddsTagValue}>{formatOdds(odds)}</Text>
          </View>
        </View>

        {/* Wallet */}
        <View style={styles.walletRow}>
          <Text style={styles.walletLabel}>💳 رصيدك المتاح</Text>
          <Text style={styles.walletBalance}>{formatCurrencyBet(WALLET_BALANCE)}</Text>
        </View>

        {/* Amount input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مبلغ الرهان</Text>
          <View style={[styles.inputWrap, overBalance && styles.inputWrapError, tooLow && styles.inputWrapError]}>
            <Text style={styles.currency}>ج.م</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
          {overBalance && <Text style={styles.errorText}>الرصيد غير كافٍ</Text>}
          {tooLow && <Text style={styles.errorText}>الحد الأدنى للرهان 100 ج.م</Text>}
        </View>

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.quickChip, numAmount === v && styles.quickChipActive]}
              onPress={() => handleQuick(v)}
            >
              <Text style={[styles.quickChipText, numAmount === v && styles.quickChipTextActive]}>
                {v >= 1000 ? `${v / 1000}K` : v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live payout preview */}
        <Animated.View style={[styles.payoutCard, { opacity: glowAnim, transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}>
          <LinearGradient colors={['#2C1F08', '#1A1200']} style={styles.payoutGrad}>
            <Text style={styles.payoutTitle}>حساب الربح المتوقع</Text>

            <View style={styles.calcRow}>
              <Text style={styles.calcValue}>{formatCurrencyBet(numAmount || 0)}</Text>
              <Text style={styles.calcLabel}>مبلغ رهانك</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcValue}>{formatOdds(odds)}</Text>
              <Text style={styles.calcLabel}>معامل الربح الحالي</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcValue}>{Math.round(COMMISSION_RATE * 100)}%</Text>
              <Text style={styles.calcLabel}>عمولة المنصة</Text>
            </View>

            <View style={styles.calcDivider} />

            <View style={styles.calcRow}>
              <Text style={[styles.calcValue, { color: Colors.successLight }]}>
                {numAmount > 0 ? '+' + formatCurrencyBet(profit) : '—'}
              </Text>
              <Text style={styles.calcLabel}>الربح الصافي</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={[styles.calcValue, styles.payoutTotal]}>
                {numAmount > 0 ? formatCurrencyBet(payout) : '—'}
              </Text>
              <Text style={styles.calcLabel}>إجمالي العائد</Text>
            </View>

            <Text style={styles.payoutDisclaimer}>
              * الأرقام تقديرية وتتغير مع دخول رهانات جديدة
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)}>
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            أوافق على شروط المراهنات وأؤكد أن عمري يتجاوز 18 سنة
          </Text>
        </TouchableOpacity>

        {/* Anti-fraud note */}
        <View style={styles.fraudNote}>
          <Text style={styles.fraudIcon}>🔐</Text>
          <Text style={styles.fraudText}>
            تخضع جميع الرهانات لمراجعة منع الاحتيال — يُمنع التلاعب
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.confirmBar}>
        <TouchableOpacity
          style={[styles.confirmBtn, !canBet && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canBet}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canBet ? [Colors.goldLight, Colors.gold, Colors.goldDark] : [Colors.bgElevated, Colors.bgElevated]}
            style={styles.confirmGrad}
          >
            <Text style={[styles.confirmText, !canBet && { color: Colors.textMuted }]}>
              {numAmount > 0 ? `راهن بـ ${formatCurrencyBet(numAmount)}` : 'أدخل مبلغ الرهان'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },

  body: { flex: 1 },

  horseCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    margin: Spacing.lg, backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  horseImage: { width: 90, height: 90 },
  horseCardBody: { flex: 1, padding: Spacing.md, alignItems: 'flex-end' },
  horseCardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 2 },
  horseBadge: {
    backgroundColor: Colors.gold + '30', borderRadius: Radius.full,
    paddingHorizontal: 7, paddingVertical: 1, borderWidth: 1, borderColor: Colors.gold,
  },
  horseBadgeText: { fontFamily: 'Cairo_700Bold', fontSize: 10, color: Colors.gold },
  horseCardName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },
  horseCardJockey: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  raceLabel: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  oddsTag: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    alignItems: 'center', marginRight: Spacing.md,
  },
  oddsTagLabel: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.bg },
  oddsTagValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },

  walletRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  walletLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  walletBalance: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.gold },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.sm },

  inputWrap: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: 2,
  },
  inputWrapError: { borderColor: Colors.live },
  currency: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textSecondary, marginLeft: Spacing.sm },
  amountInput: {
    flex: 1, fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.live, textAlign: 'right', marginTop: 4 },

  quickRow: {
    flexDirection: 'row-reverse', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickChipActive: { backgroundColor: Colors.gold + '20', borderColor: Colors.gold },
  quickChipText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary },
  quickChipTextActive: { color: Colors.gold },

  payoutCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden' },
  payoutGrad: { padding: Spacing.lg, borderWidth: 1, borderColor: Colors.gold + '40', borderRadius: Radius.xl },
  payoutTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.gold, textAlign: 'center', marginBottom: Spacing.lg },
  calcRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  calcLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  calcValue: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  calcDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  payoutTotal: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.gold },
  payoutDisclaimer: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },

  termsRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  checkmark: { fontFamily: 'Cairo_700Bold', fontSize: 11, color: Colors.bg },
  termsText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', lineHeight: 18 },

  fraudNote: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  fraudIcon: { fontSize: 16 },
  fraudText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },

  confirmBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.lg, paddingBottom: 28,
  },
  confirmBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  confirmText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },
});

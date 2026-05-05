import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const BALANCE = 85000;
const QUICK_DEPOSITS = [500, 1000, 5000, 10000, 25000, 50000];
const PAYMENT_METHODS = [
  { id: 'vodafone', name: 'فودافون كاش', icon: '📱', color: '#E60000' },
  { id: 'instapay', name: 'انستا باي', icon: '⚡', color: '#7B2FF7' },
  { id: 'card', name: 'بطاقة بنكية', icon: '💳', color: Colors.gold },
  { id: 'bank', name: 'تحويل بنكي', icon: '🏦', color: Colors.successLight },
];
const HISTORY = [
  { id: '1', type: 'deposit', label: 'إيداع — فودافون كاش', amount: 50000, date: '1 مايو', sign: '+' },
  { id: '2', type: 'bet', label: 'رهان — كأس النيل', amount: 5000, date: '1 مايو', sign: '-' },
  { id: '3', type: 'win', label: 'ربح رهان — جائزة الربيع', amount: 28000, date: '30 أبريل', sign: '+' },
  { id: '4', type: 'bid', label: 'مزايدة — الجواد شاهين', amount: 420000, date: '29 أبريل', sign: '-' },
  { id: '5', type: 'deposit', label: 'إيداع — بطاقة بنكية', amount: 100000, date: '28 أبريل', sign: '+' },
];

type Mode = 'home' | 'deposit' | 'withdraw';

export default function WalletScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('home');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const numAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const canConfirm = numAmount >= 100 && !!selectedMethod;

  function confirm() {
    if (!canConfirm) return;
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setMode('home'); setAmount(''); setSelectedMethod(''); }, 2000);
  }

  const signColor = (sign: string) => sign === '+' ? Colors.successLight : Colors.live;

  return (
    <View style={styles.container}>
      {/* Success overlay */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>{mode === 'deposit' ? '💰' : '✅'}</Text>
            <Text style={styles.successTitle}>{mode === 'deposit' ? 'تم الإيداع!' : 'تم السحب!'}</Text>
            <Text style={styles.successAmount}>{amount} ج.م</Text>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => mode !== 'home' ? setMode('home') : router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المحفظة</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceWrap}>
          <LinearGradient colors={['#2C1F08', '#1A1000']} style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
            <Text style={styles.balanceAmount}>{BALANCE.toLocaleString('ar-EG')} ج.م</Text>
            <Text style={styles.balanceSub}>محفظة آمنة — مؤمَّنة بالكامل</Text>
            <View style={styles.balanceBtns}>
              <TouchableOpacity style={styles.balanceBtn} onPress={() => { setMode('deposit'); setAmount(''); }}>
                <Text style={styles.balanceBtnText}>إيداع</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.balanceBtn, styles.balanceBtnOutline]} onPress={() => { setMode('withdraw'); setAmount(''); }}>
                <Text style={[styles.balanceBtnText, { color: Colors.gold }]}>سحب</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Deposit / Withdraw form */}
        {mode !== 'home' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{mode === 'deposit' ? 'إيداع رصيد' : 'سحب رصيد'}</Text>

            {/* Quick amounts */}
            <Text style={styles.fieldLabel}>المبلغ</Text>
            <View style={styles.quickRow}>
              {QUICK_DEPOSITS.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.quickChip, numAmount === v && styles.quickChipActive]}
                  onPress={() => setAmount(v.toLocaleString('ar-EG'))}
                >
                  <Text style={[styles.quickText, numAmount === v && styles.quickTextActive]}>
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
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

            {/* Payment methods */}
            <Text style={styles.fieldLabel}>طريقة الدفع</Text>
            <View style={styles.methodsGrid}>
              {PAYMENT_METHODS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                  onPress={() => setSelectedMethod(m.id)}
                >
                  <Text style={styles.methodIcon}>{m.icon}</Text>
                  <Text style={[styles.methodName, selectedMethod === m.id && { color: Colors.gold }]}>{m.name}</Text>
                  {selectedMethod === m.id && <View style={styles.methodCheck}><Text style={{ fontSize: 9, color: Colors.bg }}>✓</Text></View>}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, !canConfirm && styles.confirmBtnOff]}
              onPress={confirm}
              disabled={!canConfirm}
            >
              <LinearGradient
                colors={canConfirm ? [Colors.goldLight, Colors.gold] : [Colors.bgElevated, Colors.bgElevated]}
                style={styles.confirmGrad}
              >
                <Text style={[styles.confirmText, !canConfirm && { color: Colors.textMuted }]}>
                  {mode === 'deposit' ? `إيداع ${numAmount > 0 ? numAmount.toLocaleString('ar-EG') + ' ج.م' : ''}` : `سحب ${numAmount > 0 ? numAmount.toLocaleString('ar-EG') + ' ج.م' : ''}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction history */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>سجل المعاملات</Text>
          {HISTORY.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <Text style={[styles.txAmount, { color: signColor(tx.sign) }]}>
                {tx.sign}{tx.amount.toLocaleString('ar-EG')} ج.م
              </Text>
              <View style={styles.txInfo}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={[styles.txIconWrap, { backgroundColor: (tx.sign === '+' ? Colors.success : Colors.danger) + '20' }]}>
                <Text style={styles.txIcon}>{tx.sign === '+' ? '↓' : '↑'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Escrow note */}
        <View style={styles.escrowNote}>
          <Text style={styles.escrowIcon}>🔐</Text>
          <Text style={styles.escrowText}>
            رصيدك محفوظ في حساب ضمان منفصل — محمي ومؤمَّن من البنك المركزي المصري
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  successCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xxl, padding: Spacing.xxxl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gold,
  },
  successEmoji: { fontSize: 56, marginBottom: Spacing.md },
  successTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary },
  successAmount: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xl, color: Colors.gold },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },

  balanceWrap: { padding: Spacing.lg },
  balanceCard: {
    borderRadius: Radius.xxl, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gold + '50',
  },
  balanceLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  balanceAmount: { fontFamily: 'Cairo_900Black', fontSize: 40, color: Colors.gold, marginVertical: Spacing.sm },
  balanceSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.lg },
  balanceBtns: { flexDirection: 'row', gap: Spacing.lg },
  balanceBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.sm,
  },
  balanceBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.gold },
  balanceBtnText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.bg },

  formCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
  },
  formTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary, textAlign: 'right' },
  fieldLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },

  quickRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.sm },
  quickChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgElevated, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickChipActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '20' },
  quickText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.textSecondary },
  quickTextActive: { color: Colors.gold },

  inputRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: Colors.bgElevated, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg,
  },
  currency: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textSecondary },
  amountInput: {
    flex: 1, fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },

  methodsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.sm },
  methodCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgElevated, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, position: 'relative',
    minWidth: '45%',
  },
  methodCardActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '15' },
  methodIcon: { fontSize: 20 },
  methodName: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.textSecondary },
  methodCheck: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },

  confirmBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  confirmBtnOff: { opacity: 0.6 },
  confirmGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  confirmText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },

  historySection: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  historyTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },
  txRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  txIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txIcon: { fontSize: 16, color: Colors.textPrimary },
  txInfo: { flex: 1, alignItems: 'flex-end' },
  txLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary },
  txDate: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },
  txAmount: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md },

  escrowNote: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  escrowIcon: { fontSize: 18 },
  escrowText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
});

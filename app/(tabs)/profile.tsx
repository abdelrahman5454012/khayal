import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { formatCurrency } from '@/constants/data';

const USER = {
  name: 'محمد أحمد',
  id: 'EG-2024-00421',
  verified: true,
  walletBalance: 85000,
  bidsWon: 3,
  activeBids: 2,
  horses: 1,
};

const ACTIVITY = [
  { id: '1', type: 'bid', label: 'مزايدة على الجواد شاهين', amount: 420000, time: 'منذ 10 دقائق', icon: '⚖️' },
  { id: '2', type: 'win', label: 'فزت بمزاد الجواد النسر', amount: 310000, time: 'أمس', icon: '🏆' },
  { id: '3', type: 'deposit', label: 'إيداع في المحفظة', amount: 50000, time: '3 أيام', icon: '💳' },
];

function MenuRow({ icon, label, value, onPress, danger }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.menuArrow, danger && { color: Colors.danger }]}>‹</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
      <Text style={styles.menuIcon}>{icon}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>{USER.name}</Text>
          <View style={styles.idRow}>
            <Text style={styles.userId}>{USER.id}</Text>
            {USER.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>🔰 موثق</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Wallet */}
        <View style={styles.walletCard}>
          <LinearGradient colors={['#2C1F08', '#1A1200']} style={styles.walletGrad}>
            <Text style={styles.walletLabel}>رصيد المحفظة</Text>
            <Text style={styles.walletBalance}>{formatCurrency(USER.walletBalance)}</Text>
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet')}>
                <Text style={styles.walletBtnText}>إيداع</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.walletBtn, styles.walletBtnOutline]} onPress={() => router.push('/wallet')}>
                <Text style={[styles.walletBtnText, { color: Colors.gold }]}>سحب</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'مزادات ربحتها', value: USER.bidsWon, icon: '🏆' },
            { label: 'مزايدات نشطة', value: USER.activeBids, icon: '⚖️' },
            { label: 'خيولي', value: USER.horses, icon: '🐎' },
          ].map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statVal}>{stat.value}</Text>
              <Text style={styles.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر النشاطات</Text>
          {ACTIVITY.map(act => (
            <View key={act.id} style={styles.activityRow}>
              <Text style={[styles.actAmount, { color: act.type === 'deposit' ? Colors.successLight : Colors.gold }]}>
                {formatCurrency(act.amount)}
              </Text>
              <View style={styles.actInfo}>
                <Text style={styles.actLabel}>{act.label}</Text>
                <Text style={styles.actTime}>{act.time}</Text>
              </View>
              <View style={styles.actIconWrap}>
                <Text style={styles.actIcon}>{act.icon}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="🐎" label="خيولي" />
            <View style={styles.menuDivider} />
            <MenuRow icon="📋" label="سجل المزادات" />
            <View style={styles.menuDivider} />
            <MenuRow icon="💳" label="طرق الدفع" />
            <View style={styles.menuDivider} />
            <MenuRow icon="🔔" label="الإشعارات" />
            <View style={styles.menuDivider} />
            <MenuRow icon="🔐" label="الأمان والتحقق" />
            <View style={styles.menuDivider} />
            <MenuRow icon="🚪" label="تسجيل الخروج" danger />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  profileHeader: {
    paddingTop: 60, paddingBottom: Spacing.xl, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatarWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.gold, marginBottom: Spacing.md,
  },
  avatarEmoji: { fontSize: 36 },
  userName: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  userId: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  verifiedBadge: {
    backgroundColor: Colors.success + '30', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.success,
  },
  verifiedText: { fontFamily: 'Cairo_600SemiBold', fontSize: 10, color: Colors.successLight },

  walletCard: { margin: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden' },
  walletGrad: { padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
  walletLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  walletBalance: { fontFamily: 'Cairo_900Black', fontSize: FontSize.display, color: Colors.gold, marginVertical: Spacing.sm },
  walletActions: { flexDirection: 'row', gap: Spacing.lg },
  walletBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.sm,
  },
  walletBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.gold },
  walletBtnText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.bg },

  statsRow: { flexDirection: 'row-reverse', marginHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    alignItems: 'center', paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statVal: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },
  statLbl: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },

  activityRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  actIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  actIcon: { fontSize: 18 },
  actInfo: { flex: 1, alignItems: 'flex-end' },
  actLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary },
  actTime: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },
  actAmount: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm },

  menuCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  menuValue: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
});

import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { MY_BETS, BETTING_RACES, formatCurrencyBet, MyBet } from '@/constants/betting';

const TABS = ['الكل', 'نشطة', 'فائزة', 'خاسرة'];

const STATUS_CONFIG: Record<MyBet['status'], { label: string; color: string; icon: string }> = {
  active:    { label: 'نشط',    color: Colors.gold,         icon: '⏳' },
  won:       { label: 'فزت',    color: Colors.successLight, icon: '🏆' },
  lost:      { label: 'خسرت',   color: Colors.live,         icon: '❌' },
  cancelled: { label: 'ملغي',   color: Colors.textMuted,    icon: '🚫' },
};

const TAB_FILTERS: Record<string, MyBet['status'][]> = {
  'الكل':   ['active', 'won', 'lost', 'cancelled'],
  'نشطة':   ['active'],
  'فائزة':  ['won'],
  'خاسرة':  ['lost'],
};

function BetCard({ bet }: { bet: MyBet }) {
  const cfg = STATUS_CONFIG[bet.status];
  const isActive = bet.status === 'active';
  const isWon = bet.status === 'won';

  return (
    <View style={[styles.betCard, isWon && styles.betCardWon, isActive && styles.betCardActive]}>
      {/* Top row */}
      <View style={styles.betTop}>
        <View style={[styles.statusBadge, { borderColor: cfg.color + '60' }]}>
          <Text style={styles.statusIcon}>{cfg.icon}</Text>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={styles.betTitles}>
          <Text style={styles.raceName}>{bet.raceName}</Text>
          <Text style={styles.horseName}>{bet.horseName}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.betStats}>
        <View style={styles.betStat}>
          <Text style={styles.betStatLabel}>رهانك</Text>
          <Text style={styles.betStatValue}>{formatCurrencyBet(bet.amount)}</Text>
        </View>
        <View style={styles.betStatDivider} />
        <View style={styles.betStat}>
          <Text style={styles.betStatLabel}>معامل الربح</Text>
          <Text style={styles.betStatValue}>{bet.odds}x</Text>
        </View>
        <View style={styles.betStatDivider} />
        <View style={styles.betStat}>
          <Text style={styles.betStatLabel}>{isWon ? 'ربحك' : 'ربح محتمل'}</Text>
          <Text style={[styles.betStatValue,
            isWon ? { color: Colors.successLight } :
            bet.status === 'lost' ? { color: Colors.textMuted } :
            { color: Colors.gold }
          ]}>
            {bet.status === 'lost' ? '—' : formatCurrencyBet(bet.potentialPayout)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.betFooter}>
        <Text style={styles.betTime}>{bet.placedAt}</Text>
        {isActive && (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ينتظر نتيجة السباق</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function BetsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('الكل');

  const filtered = MY_BETS.filter(b => TAB_FILTERS[activeTab].includes(b.status));
  const totalActive = MY_BETS.filter(b => b.status === 'active').reduce((s, b) => s + b.amount, 0);
  const totalPotential = MY_BETS.filter(b => b.status === 'active').reduce((s, b) => s + b.potentialPayout, 0);
  const totalWon = MY_BETS.filter(b => b.status === 'won').reduce((s, b) => s + b.potentialPayout, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>رهاناتي</Text>
        <Text style={styles.subtitle}>متابعة رهاناتك الحالية والسابقة</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <LinearGradient colors={['#2C1F08', '#1A1200']} style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>⏳</Text>
          <Text style={styles.summaryLabel}>رهانات نشطة</Text>
          <Text style={styles.summaryValue}>{formatCurrencyBet(totalActive)}</Text>
          <Text style={styles.summaryNote}>ربح محتمل: {formatCurrencyBet(totalPotential)}</Text>
        </LinearGradient>
        <LinearGradient colors={['#0A1F0F', '#061209']} style={[styles.summaryCard, { borderColor: Colors.success + '60' }]}>
          <Text style={styles.summaryIcon}>🏆</Text>
          <Text style={styles.summaryLabel}>إجمالي مكاسبك</Text>
          <Text style={[styles.summaryValue, { color: Colors.successLight }]}>{formatCurrencyBet(totalWon)}</Text>
          <Text style={styles.summaryNote}>{MY_BETS.filter(b => b.status === 'won').length} سباق فزت به</Text>
        </LinearGradient>
      </View>

      {/* Bet on new race CTA */}
      <TouchableOpacity style={styles.newBetBtn} onPress={() => router.push('/races')}>
        <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.newBetGrad}>
          <Text style={styles.newBetText}>🏇 راهن على سباق جديد</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Tabs */}
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

      {/* Bets List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>لا توجد رهانات</Text>
            <Text style={styles.emptyText}>راهن على السباقات القادمة لتظهر هنا</Text>
          </View>
        ) : (
          filtered.map(bet => <BetCard key={bet.id} bet={bet} />)
        )}
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

  summaryRow: { flexDirection: 'row-reverse', gap: Spacing.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  summaryCard: {
    flex: 1, borderRadius: Radius.xl, padding: Spacing.md,
    alignItems: 'flex-end', borderWidth: 1, borderColor: Colors.gold + '40',
  },
  summaryIcon: { fontSize: 22, marginBottom: 4 },
  summaryLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  summaryValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.gold },
  summaryNote: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'right' },

  newBetBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  newBetGrad: { paddingVertical: Spacing.md, alignItems: 'center' },
  newBetText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },

  tabs: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tabText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.bg },

  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md },

  betCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  betCardWon: { borderColor: Colors.success, backgroundColor: '#0A1F0F' },
  betCardActive: { borderColor: Colors.gold + '60' },

  betTop: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.md, paddingBottom: 0 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0,
  },
  statusIcon: { fontSize: 12 },
  statusLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs },
  betTitles: { flex: 1, alignItems: 'flex-end' },
  raceName: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  horseName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary },

  betStats: {
    flexDirection: 'row-reverse', padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm,
  },
  betStat: { flex: 1, alignItems: 'center' },
  betStatLabel: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  betStatValue: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textPrimary },
  betStatDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },

  betFooter: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  betTime: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },
  livePill: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gold + '15', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.gold },
  liveText: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.gold },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xl, color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textSecondary },
});

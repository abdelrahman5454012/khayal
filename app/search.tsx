import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { BETTING_RACES, formatCurrencyBet } from '@/constants/betting';
import { ACTIVE_AUCTIONS, TOP_HORSES, formatCurrency } from '@/constants/data';

const ALL_HORSES = [
  { id: '1', name: 'الجواد بدران', breed: 'عربي أصيل', rating: 98, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', type: 'horse' as const },
  { id: '2', name: 'الجواد شاهين', breed: 'عربي أصيل', rating: 96, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', type: 'horse' as const },
  { id: '3', name: 'الجواد سيوف', breed: 'إنجليزي', rating: 94, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', type: 'horse' as const },
  { id: '4', name: 'الجواد عزام', breed: 'عربي مصري', rating: 97, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', type: 'horse' as const },
];

const RECENT = ['الجواد شاهين', 'كأس النيل', 'مزاد رقم 45'];
const TRENDING = ['الجواد بدران', 'كأس الجمهورية', 'الفرس ديم'];

type ResultType = 'horse' | 'race' | 'auction';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useCallback(() => {
    if (!query.trim()) return { horses: [], races: [], auctions: [] };
    const q = query.toLowerCase();
    return {
      horses: ALL_HORSES.filter(h => h.name.includes(query) || h.breed.includes(query)),
      races: BETTING_RACES.filter(r => r.name.includes(query) || r.venue.includes(query)),
      auctions: ACTIVE_AUCTIONS.filter(a => a.name.includes(query)),
    };
  }, [query]);

  const { horses, races, auctions } = results();
  const hasResults = horses.length + races.length + auctions.length > 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن خيول، سباقات، مزادات..."
            placeholderTextColor={Colors.textMuted}
            textAlign="right"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* No query — show recent + trending */}
        {!query && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕐 بحث مؤخر</Text>
              {RECENT.map((term, i) => (
                <TouchableOpacity key={i} style={styles.historyRow} onPress={() => setQuery(term)}>
                  <Text style={styles.historyArrow}>←</Text>
                  <Text style={styles.historyTerm}>{term}</Text>
                  <Text style={styles.historyIcon}>🕐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 الأكثر بحثًا</Text>
              <View style={styles.trendingRow}>
                {TRENDING.map((term, i) => (
                  <TouchableOpacity key={i} style={styles.trendingChip} onPress={() => setQuery(term)}>
                    <Text style={styles.trendingText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Results */}
        {query.length > 0 && !hasResults && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
            <Text style={styles.emptyText}>جرّب كلمة بحث مختلفة</Text>
          </View>
        )}

        {horses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐎 خيول ({horses.length})</Text>
            {horses.map(h => (
              <TouchableOpacity key={h.id} style={styles.resultRow} onPress={() => router.push(`/horse/${h.id}`)}>
                <Image source={{ uri: h.image }} style={styles.resultImg} />
                <View style={styles.resultBody}>
                  <Text style={styles.resultName}>{h.name}</Text>
                  <Text style={styles.resultSub}>{h.breed} • تصنيف {h.rating}</Text>
                </View>
                <Text style={styles.resultArrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {races.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏇 سباقات ({races.length})</Text>
            {races.map(r => (
              <TouchableOpacity key={r.id} style={styles.resultRow} onPress={() => router.push(`/race/${r.id}`)}>
                <View style={styles.resultIconWrap}>
                  <Text style={{ fontSize: 24 }}>🏇</Text>
                </View>
                <View style={styles.resultBody}>
                  <Text style={styles.resultName}>{r.name}</Text>
                  <Text style={styles.resultSub}>{r.venue} • {r.date} {r.startTime}</Text>
                </View>
                <View style={[styles.statusPill, r.status === 'open' && { borderColor: Colors.successLight }]}>
                  <Text style={[styles.statusText, r.status === 'open' && { color: Colors.successLight }]}>
                    {r.status === 'open' ? 'مفتوح' : 'قريبًا'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {auctions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚖️ مزادات ({auctions.length})</Text>
            {auctions.map(a => (
              <TouchableOpacity key={a.id} style={styles.resultRow} onPress={() => router.push(`/auction/${a.id}`)}>
                <Image source={{ uri: a.image }} style={styles.resultImg} />
                <View style={styles.resultBody}>
                  <Text style={styles.resultName}>{a.name}</Text>
                  <Text style={styles.resultSub}>أعلى مزايد: {formatCurrency(a.currentBid)}</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>مباشر</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  searchHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    paddingTop: 52, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  inputWrap: {
    flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.md,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },
  clearBtn: { fontSize: 14, color: Colors.textMuted, paddingLeft: 4 },

  scroll: { padding: Spacing.lg },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },

  historyRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  historyIcon: { fontSize: 14 },
  historyTerm: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'right' },
  historyArrow: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted },

  trendingRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.sm },
  trendingChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  trendingText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },

  resultRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  resultImg: { width: 48, height: 48, borderRadius: 24 },
  resultIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  resultBody: { flex: 1, alignItems: 'flex-end' },
  resultName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  resultSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  resultArrow: { fontSize: 18, color: Colors.textMuted },

  statusPill: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  statusText: { fontFamily: 'Cairo_600SemiBold', fontSize: 10, color: Colors.textMuted },

  livePill: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: Colors.danger + '20', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.danger + '50',
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.live },
  liveText: { fontFamily: 'Cairo_700Bold', fontSize: 10, color: Colors.live },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xl, color: Colors.textPrimary },
  emptyText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textSecondary },
});

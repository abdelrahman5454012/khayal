import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { TOP_HORSES, formatCurrency } from '@/constants/data';

const ALL_HORSES = [
  { id: '1', name: 'الجواد بدران', breed: 'عربي أصيل', age: 6, wins: 18, rating: 98, price: 650000, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', status: 'للبيع' },
  { id: '2', name: 'الجواد شاهين', breed: 'عربي أصيل', age: 5, wins: 12, rating: 96, price: 420000, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', status: 'في مزاد' },
  { id: '3', name: 'الجواد سيوف', breed: 'إنجليزي', age: 4, wins: 8, rating: 94, price: 350000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', status: 'للبيع' },
  { id: '4', name: 'الفرس ديم', breed: 'عربي أصيل', age: 4, wins: 6, rating: 90, price: 280000, image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=400&q=80', status: 'في مزاد' },
  { id: '5', name: 'الجواد عزام', breed: 'عربي مصري', age: 7, wins: 20, rating: 97, price: 580000, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', status: 'غير متاح' },
];

const STATUS_COLORS: Record<string, string> = {
  'للبيع': Colors.successLight,
  'في مزاد': Colors.live,
  'غير متاح': Colors.textMuted,
};

export default function HorsesScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>جميع الخيل</Text>
        <Text style={styles.subtitle}>السجل الوطني للخيول</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="ابحث عن جواد..."
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {ALL_HORSES.map(horse => (
          <TouchableOpacity
            key={horse.id}
            style={styles.horseCard}
            onPress={() => router.push(`/horse/${horse.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: horse.image }} style={styles.horseImage} />
            <View style={styles.horseBody}>
              <View style={styles.horseTop}>
                <View style={[styles.statusBadge, { borderColor: STATUS_COLORS[horse.status] + '80' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[horse.status] }]}>{horse.status}</Text>
                </View>
                <Text style={styles.horseName}>{horse.name}</Text>
              </View>
              <Text style={styles.horseBreed}>{horse.breed} • {horse.age} سنوات</Text>
              <View style={styles.horseStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{horse.wins}</Text>
                  <Text style={styles.statLbl}>انتصار</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: Colors.gold }]}>{horse.rating}</Text>
                  <Text style={styles.statLbl}>تصنيف</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: Colors.gold, fontSize: FontSize.sm }]}>
                    {formatCurrency(horse.price)}
                  </Text>
                  <Text style={styles.statLbl}>السعر</Text>
                </View>
              </View>
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

  searchRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  search: {
    flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.md,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },
  searchIcon: { fontSize: 18 },

  list: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  horseCard: {
    flexDirection: 'row-reverse', backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  horseImage: { width: 110, height: 120 },
  horseBody: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  horseTop: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-end',
    backgroundColor: 'transparent',
  },
  statusText: { fontFamily: 'Cairo_600SemiBold', fontSize: 10 },
  horseName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right' },
  horseBreed: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  horseStats: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  statItem: { alignItems: 'center' },
  statVal: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  statLbl: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.textMuted },
  statDivider: { width: 1, height: 24, backgroundColor: Colors.border },
});

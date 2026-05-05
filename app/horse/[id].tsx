import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { formatCurrency } from '@/constants/data';

const HORSE = {
  id: '1',
  name: 'الجواد شاهين',
  breed: 'عربي أصيل',
  age: 5,
  wins: 12,
  rank: 2,
  rating: 96,
  badge: 'بطل',
  currentPrice: 420000,
  image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
  owner: 'إسطبل النيل الملكي',
  pedigree: {
    father: { name: 'الفحل بدران', grandfather: 'الفحل نجم', grandmother: 'الفرس ريم' },
    mother: { name: 'الفرس نوف', grandfather: 'الفحل سيف', grandmother: 'الفرس لولوة' },
  },
  races: [
    { name: 'كأس النيل', position: 1, time: '1:58.4', date: '10 مارس' },
    { name: 'جائزة الربيع', position: 2, time: '2:01.2', date: '5 فبراير' },
    { name: 'كأس الجمهورية', position: 1, time: '1:59.8', date: '12 يناير' },
  ],
  healthStatus: 'سليم',
  lastVetCheck: '1 مايو 2026',
};

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.value, color ? { color } : {}]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    alignItems: 'center', paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  value: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },
  label: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
});

export default function HorseScreen() {
  const router = useRouter();
  const horse = HORSE;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image source={{ uri: horse.image }} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', Colors.bg]}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{horse.badge}</Text>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroName}>{horse.name}</Text>
          <Text style={styles.heroBreed}>{horse.breed} • {horse.age} سنوات</Text>
          <Text style={styles.heroOwner}>🏛 {horse.owner}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox label="التصنيف" value={horse.rating} color={Colors.gold} />
          <StatBox label="الانتصارات" value={horse.wins} />
          <StatBox label="المركز" value={`#${horse.rank}`} color={Colors.gold} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.auctionBtn} onPress={() => router.push('/auction/1')}>
            <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.btnGrad}>
              <Text style={styles.auctionBtnText}>ادخل المزاد</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>شراء مباشر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>ضع رهان</Text>
          </TouchableOpacity>
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>السعر الحالي</Text>
          <Text style={styles.priceValue}>{formatCurrency(horse.currentPrice)}</Text>
        </View>

        {/* Pedigree */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>شجرة النسب</Text>
          <View style={styles.pedigreeBox}>
            <View style={styles.pedigreeCenter}>
              <Text style={styles.pedigreeSelf}>{horse.name}</Text>
            </View>
            <View style={styles.pedigreeParents}>
              <View style={styles.pedigreeParent}>
                <Text style={styles.pedigreeParentLabel}>الأم</Text>
                <Text style={styles.pedigreeParentName}>{horse.pedigree.mother.name}</Text>
                <Text style={styles.pedigreeGrand}>جد: {horse.pedigree.mother.grandfather}</Text>
                <Text style={styles.pedigreeGrand}>جدة: {horse.pedigree.mother.grandmother}</Text>
              </View>
              <View style={styles.pedigreeParent}>
                <Text style={styles.pedigreeParentLabel}>الأب</Text>
                <Text style={styles.pedigreeParentName}>{horse.pedigree.father.name}</Text>
                <Text style={styles.pedigreeGrand}>جد: {horse.pedigree.father.grandfather}</Text>
                <Text style={styles.pedigreeGrand}>جدة: {horse.pedigree.father.grandmother}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Race History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل السباقات</Text>
          {horse.races.map((race, i) => (
            <View key={i} style={styles.raceRow}>
              <View style={[styles.positionBadge, race.position === 1 && styles.positionFirst]}>
                <Text style={styles.positionText}>#{race.position}</Text>
              </View>
              <View style={styles.raceInfo}>
                <Text style={styles.raceName}>{race.name}</Text>
                <Text style={styles.raceDate}>{race.date}</Text>
              </View>
              <Text style={styles.raceTime}>{race.time}</Text>
            </View>
          ))}
        </View>

        {/* Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>السجل الصحي</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthBadge}>
              <Text style={styles.healthIcon}>✅</Text>
              <Text style={styles.healthStatus}>{horse.healthStatus}</Text>
            </View>
            <Text style={styles.healthDate}>آخر فحص بيطري: {horse.lastVetCheck}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>🔰 موثق رسميًا</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', top: 52, right: Spacing.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  heroBadge: {
    position: 'absolute', top: 52, left: Spacing.lg,
    backgroundColor: Colors.gold, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  heroBadgeText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.xs, color: Colors.bg },
  heroBottom: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg },
  heroName: { fontFamily: 'Cairo_900Black', fontSize: 28, color: Colors.textPrimary, textAlign: 'right' },
  heroBreed: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  heroOwner: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold, textAlign: 'right' },

  body: { flex: 1 },

  statsRow: { flexDirection: 'row-reverse', gap: Spacing.md, margin: Spacing.lg },

  actionRow: { flexDirection: 'row-reverse', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  auctionBtn: { flex: 2, borderRadius: Radius.md, overflow: 'hidden' },
  btnGrad: { paddingVertical: Spacing.md, alignItems: 'center' },
  auctionBtnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.md, color: Colors.bg },
  secondaryBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  secondaryBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.textPrimary },

  priceCard: {
    marginHorizontal: Spacing.lg, backgroundColor: '#2C1F08',
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.gold,
    alignItems: 'flex-end', marginBottom: Spacing.lg,
  },
  priceLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  priceValue: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl, color: Colors.gold },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },

  pedigreeBox: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  pedigreeCenter: { alignItems: 'center', marginBottom: Spacing.md },
  pedigreeSelf: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.gold },
  pedigreeParents: { flexDirection: 'row-reverse', gap: Spacing.md },
  pedigreeParent: { flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'flex-end' },
  pedigreeParentLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold },
  pedigreeParentName: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textPrimary },
  pedigreeGrand: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textSecondary },

  raceRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  positionBadge: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgElevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  positionFirst: { backgroundColor: Colors.gold + '30', borderColor: Colors.gold },
  positionText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textPrimary },
  raceInfo: { flex: 1, alignItems: 'flex-end' },
  raceName: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary },
  raceDate: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary },
  raceTime: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.gold },

  healthCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'flex-end',
  },
  healthBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  healthIcon: { fontSize: 18 },
  healthStatus: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.successLight },
  healthDate: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  verifiedBadge: {
    backgroundColor: Colors.success + '30', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colors.success,
  },
  verifiedText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.successLight },
});

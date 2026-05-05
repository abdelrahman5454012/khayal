import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const STEPS = [
  { id: 'national_id', icon: '🪪', title: 'الرقم القومي', desc: 'أدخل رقمك القومي المصري المكون من 14 رقمًا', done: false },
  { id: 'selfie', icon: '🤳', title: 'صورة شخصية', desc: 'صورة واضحة لوجهك مع بطاقتك', done: false },
  { id: 'license', icon: '📜', title: 'رخصة الفروسية', desc: 'اختياري — لأصحاب الإسطبلات والفرسان', done: false },
];

export default function VerifyScreen() {
  const router = useRouter();
  const [steps, setSteps] = useState(STEPS);
  const [submitted, setSubmitted] = useState(false);

  function markDone(id: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: true } : s));
  }

  const requiredDone = steps.filter(s => s.id !== 'license').every(s => s.done);

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={StyleSheet.absoluteFill} />
        <Text style={styles.successIcon}>⏳</Text>
        <Text style={styles.successTitle}>طلبك قيد المراجعة</Text>
        <Text style={styles.successSub}>سيتم التحقق من هويتك خلال 24 ساعة. ستصلك رسالة نصية عند الموافقة.</Text>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.homeBtnGrad}>
            <Text style={styles.homeBtnText}>الذهاب للرئيسية</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>›</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>التحقق من الهوية</Text>
        <Text style={styles.sub}>مطلوب للمشاركة في المزادات والمراهنات</Text>

        {/* Gov trust badge */}
        <View style={styles.govBadge}>
          <Text style={styles.govIcon}>🔰</Text>
          <Text style={styles.govText}>بياناتك محمية ومشفرة وفق معايير الحكومة المصرية</Text>
        </View>

        {/* Steps */}
        {steps.map((step, idx) => (
          <View key={step.id} style={[styles.stepCard, step.done && styles.stepCardDone]}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepNum, step.done && styles.stepNumDone]}>
                {step.done
                  ? <Text style={styles.stepCheck}>✓</Text>
                  : <Text style={styles.stepNumText}>{idx + 1}</Text>
                }
              </View>
            </View>
            <View style={styles.stepBody}>
              <View style={styles.stepTitleRow}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={[styles.stepTitle, step.done && { color: Colors.successLight }]}>{step.title}</Text>
                {step.id === 'license' && (
                  <View style={styles.optBadge}><Text style={styles.optText}>اختياري</Text></View>
                )}
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadBtn, step.done && styles.uploadBtnDone]}
              onPress={() => markDone(step.id)}
            >
              <Text style={[styles.uploadText, step.done && styles.uploadTextDone]}>
                {step.done ? 'تم ✓' : 'رفع'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.note}>
          * ستُراجَع المستندات خلال 24 ساعة من قِبَل فريقنا
        </Text>
      </View>

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.submitBtn, !requiredDone && styles.submitBtnDisabled]}
          onPress={() => setSubmitted(true)}
          disabled={!requiredDone}
        >
          <LinearGradient
            colors={requiredDone ? [Colors.goldLight, Colors.gold] : [Colors.bgElevated, Colors.bgElevated]}
            style={styles.submitGrad}
          >
            <Text style={[styles.submitText, !requiredDone && { color: Colors.textMuted }]}>
              إرسال طلب التحقق
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skipText}>تخطّى — سأكمل لاحقًا</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: {
    position: 'absolute', top: 52, right: Spacing.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, zIndex: 10,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },

  content: { flex: 1, padding: Spacing.lg, paddingTop: 100, gap: Spacing.md },
  title: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  govBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.success + '15', borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.success + '40',
  },
  govIcon: { fontSize: 20 },
  govText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.successLight, textAlign: 'right' },

  stepCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  stepCardDone: { borderColor: Colors.success + '60', backgroundColor: '#0A1F0F' },
  stepLeft: { flexShrink: 0 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgElevated, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepNumText: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textMuted },
  stepCheck: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: '#fff' },
  stepBody: { flex: 1, alignItems: 'flex-end', gap: 2 },
  stepTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  stepIcon: { fontSize: 18 },
  stepTitle: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  stepDesc: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  optBadge: {
    backgroundColor: Colors.gold + '20', borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.gold + '60',
  },
  optText: { fontFamily: 'Cairo_400Regular', fontSize: 9, color: Colors.gold },
  uploadBtn: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  uploadBtnDone: { borderColor: Colors.success, backgroundColor: Colors.success + '20' },
  uploadText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.xs, color: Colors.textSecondary },
  uploadTextDone: { color: Colors.successLight },

  note: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'right' },

  ctaWrap: { padding: Spacing.lg, paddingBottom: 40, gap: Spacing.md, alignItems: 'center' },
  submitBtn: { width: '100%', borderRadius: Radius.lg, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.6 },
  submitGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  submitText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },
  skipText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textMuted },

  successContainer: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 72, marginBottom: Spacing.lg },
  successTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, marginBottom: Spacing.md },
  successSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxxl, lineHeight: 26 },
  homeBtn: { width: '100%', borderRadius: Radius.lg, overflow: 'hidden' },
  homeBtnGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  homeBtnText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },
});

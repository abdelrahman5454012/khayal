import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const ACCOUNT_TYPES = [
  { id: 'bidder', label: 'مزايد / مراهن', icon: '💰', desc: 'شراء الخيول والمراهنة على السباقات' },
  { id: 'stable', label: 'صاحب إسطبل', icon: '🏛️', desc: 'بيع الخيول وإدارة المزادات' },
  { id: 'jockey', label: 'فارس', icon: '🏇', desc: 'المشاركة في السباقات الرسمية' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });

  function next() {
    if (step < 3) setStep(step + 1);
    else router.push('/auth/verify');
  }

  const canProceedStep1 = !!accountType;
  const canProceedStep2 = form.name && form.phone && form.email;
  const canProceedStep3 = form.password && form.password === form.confirmPassword && form.password.length >= 8;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إنشاء حساب</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.progressStep, s <= step && styles.progressStepActive]}>
            <Text style={[styles.progressNum, s <= step && styles.progressNumActive]}>{s}</Text>
          </View>
        ))}
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
      </View>
      <Text style={styles.progressLabel}>
        {step === 1 ? 'نوع الحساب' : step === 2 ? 'البيانات الشخصية' : 'كلمة المرور'}
      </Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 1 — Account type */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>ما نوع حسابك؟</Text>
            <Text style={styles.stepSub}>اختر النوع المناسب لاحتياجاتك</Text>
            {ACCOUNT_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, accountType === t.id && styles.typeCardActive]}
                onPress={() => setAccountType(t.id)}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <View style={styles.typeBody}>
                  <Text style={[styles.typeLabel, accountType === t.id && { color: Colors.gold }]}>{t.label}</Text>
                  <Text style={styles.typeDesc}>{t.desc}</Text>
                </View>
                <View style={[styles.typeCheck, accountType === t.id && styles.typeCheckActive]}>
                  {accountType === t.id && <Text style={styles.typeCheckMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2 — Personal info */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>بياناتك الشخصية</Text>
            <Text style={styles.stepSub}>ستُستخدم للتحقق من هويتك</Text>
            {[
              { key: 'name', label: 'الاسم الكامل', placeholder: 'محمد أحمد علي', type: 'default' },
              { key: 'phone', label: 'رقم الهاتف', placeholder: '01X XXXX XXXX', type: 'phone-pad' },
              { key: 'email', label: 'البريد الإلكتروني', placeholder: 'you@example.com', type: 'email-address' },
            ].map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={field.type as any}
                  textAlign="right"
                />
              </View>
            ))}
          </View>
        )}

        {/* Step 3 — Password */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>أنشئ كلمة مرور</Text>
            <Text style={styles.stepSub}>8 أحرف على الأقل</Text>
            {[
              { key: 'password', label: 'كلمة المرور' },
              { key: 'confirmPassword', label: 'تأكيد كلمة المرور' },
            ].map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  textAlign="right"
                />
              </View>
            ))}
            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
              <Text style={styles.errorText}>كلمتا المرور غير متطابقتين</Text>
            )}
            <View style={styles.strengthRow}>
              {['8 أحرف', 'أرقام', 'رموز'].map((req, i) => (
                <View key={i} style={[styles.reqChip, form.password.length >= 8 && styles.reqChipMet]}>
                  <Text style={[styles.reqText, form.password.length >= 8 && styles.reqTextMet]}>{req}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.nextBtn,
            !(step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : canProceedStep3) && styles.nextBtnDisabled
          ]}
          onPress={next}
          disabled={!(step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : canProceedStep3)}
        >
          <LinearGradient
            colors={(step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : canProceedStep3)
              ? [Colors.goldLight, Colors.gold, Colors.goldDark]
              : [Colors.bgElevated, Colors.bgElevated]}
            style={styles.nextGrad}
          >
            <Text style={[styles.nextText,
              !(step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : canProceedStep3) && { color: Colors.textMuted }
            ]}>
              {step === 3 ? 'إنشاء الحساب' : 'التالي'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },

  progressRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 0, paddingHorizontal: Spacing.xxxl, marginBottom: 4, position: 'relative',
  },
  progressStep: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  progressStepActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '20' },
  progressNum: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.textMuted },
  progressNumActive: { color: Colors.gold },
  progressLine: { flex: 1, height: 2, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.gold },
  progressLabel: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },

  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1 },
  stepContent: { gap: Spacing.md },
  stepTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right' },
  stepSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm },

  typeCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
  },
  typeCardActive: { borderColor: Colors.gold, backgroundColor: '#2C1F08' },
  typeIcon: { fontSize: 30 },
  typeBody: { flex: 1, alignItems: 'flex-end' },
  typeLabel: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.md, color: Colors.textPrimary },
  typeDesc: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  typeCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  typeCheckActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  typeCheckMark: { fontFamily: 'Cairo_700Bold', fontSize: 11, color: Colors.bg },

  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textPrimary,
  },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.live, textAlign: 'right' },
  strengthRow: { flexDirection: 'row-reverse', gap: Spacing.sm, flexWrap: 'wrap' },
  reqChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  reqChipMet: { borderColor: Colors.successLight, backgroundColor: Colors.success + '20' },
  reqText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textMuted },
  reqTextMet: { color: Colors.successLight },

  ctaWrap: { padding: Spacing.lg, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border },
  nextBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  nextText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },
});

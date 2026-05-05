import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleLogin() {
    if (!phone || !password) { shake(); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1200);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>خيّال</Text>
          <Text style={styles.logoSub}>المنصة الرسمية للخيل في مصر</Text>
        </View>

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>
          <Text style={styles.cardSub}>أدخل بياناتك للمتابعة</Text>

          {/* Phone */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>رقم الهاتف</Text>
            <View style={styles.inputRow}>
              <Text style={styles.flagPrefix}>🇪🇬 +20</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="1XX XXX XXXX"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>كلمة المرور</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPass}
                textAlign="right"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotRow} onPress={() => router.push('/auth/otp')}>
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
              style={styles.loginGrad}
            >
              {loading
                ? <Text style={styles.loginText}>جاري الدخول...</Text>
                : <Text style={styles.loginText}>دخول</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OTP login */}
          <TouchableOpacity style={styles.otpBtn} onPress={() => router.push('/auth/otp')}>
            <Text style={styles.otpText}>دخول برمز OTP</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Register */}
        <View style={styles.registerRow}>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
          <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
        </View>

        {/* Gov badge */}
        <View style={styles.govBadge}>
          <Text style={styles.govIcon}>🔰</Text>
          <Text style={styles.govText}>منصة معتمدة رسميًا من الاتحاد المصري للفروسية</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: 80 },

  logoSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logo: { fontFamily: 'Cairo_900Black', fontSize: 52, color: Colors.gold, letterSpacing: 2 },
  logoSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xxl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  cardTitle: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'right', marginBottom: 4 },
  cardSub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.xl },

  fieldWrap: { marginBottom: Spacing.lg },
  fieldLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: Colors.bgElevated, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  flagPrefix: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.sm, color: Colors.textSecondary, paddingLeft: Spacing.sm },
  input: {
    flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.md,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
  },
  eyeBtn: { paddingLeft: Spacing.sm },
  eyeIcon: { fontSize: 18 },

  forgotRow: { alignItems: 'flex-start', marginBottom: Spacing.lg },
  forgotText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.gold },

  loginBtn: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  loginGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  loginText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textMuted },

  otpBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  otpText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.md, color: Colors.textPrimary },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  registerText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textSecondary },
  registerLink: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.gold },

  govBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  govIcon: { fontSize: 18 },
  govText: { flex: 1, fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
});

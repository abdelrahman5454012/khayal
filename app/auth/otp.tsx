import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleChange(val: string, idx: number) {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) handleVerify(next.join(''));
  }

  function handleKeyPress(e: any, idx: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleVerify(code?: string) {
    const finalCode = code ?? otp.join('');
    if (finalCode.length < OTP_LENGTH) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
      setTimeout(() => router.replace('/auth/verify'), 1000);
    }, 1000);
  }

  const filled = otp.filter(Boolean).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bgCardAlt, Colors.bg]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>›</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>📱</Text>
        <Text style={styles.title}>تحقق من هاتفك</Text>
        <Text style={styles.sub}>أرسلنا رمز مكون من 6 أرقام إلى</Text>
        <Text style={styles.phone}>+20 1XX XXX XXXX</Text>

        {/* OTP boxes — RTL so first digit on right */}
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { inputRefs.current[idx] = r; }}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={v => handleChange(v, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${(filled / OTP_LENGTH) * 100}%` }]} />
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.verifyBtn, filled < OTP_LENGTH && styles.verifyBtnDisabled]}
          onPress={() => handleVerify()}
          disabled={filled < OTP_LENGTH || verifying}
        >
          <LinearGradient
            colors={filled === OTP_LENGTH ? [Colors.goldLight, Colors.gold] : [Colors.bgElevated, Colors.bgElevated]}
            style={styles.verifyGrad}
          >
            <Text style={[styles.verifyText, filled < OTP_LENGTH && { color: Colors.textMuted }]}>
              {verifying ? 'جاري التحقق...' : 'تحقق'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          {timer > 0
            ? <Text style={styles.resendTimer}>إعادة الإرسال خلال {timer}ث</Text>
            : (
              <TouchableOpacity onPress={() => setTimer(RESEND_SECONDS)}>
                <Text style={styles.resendLink}>إعادة إرسال الرمز</Text>
              </TouchableOpacity>
            )
          }
        </View>
      </View>

      {/* Success overlay */}
      <Animated.View style={[styles.successOverlay, { transform: [{ scale: successScale }], opacity: successScale }]}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>تم التحقق!</Text>
      </Animated.View>
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

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  icon: { fontSize: 56, marginBottom: Spacing.lg },
  title: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary, marginBottom: 4 },
  sub: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.md, color: Colors.textSecondary },
  phone: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.lg, color: Colors.gold, marginBottom: Spacing.xxxl },

  otpRow: { flexDirection: 'row-reverse', gap: Spacing.sm, marginBottom: Spacing.md },
  otpBox: {
    width: 48, height: 56, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border,
    fontFamily: 'Cairo_900Black', fontSize: FontSize.xxl, color: Colors.textPrimary,
  },
  otpBoxFilled: { borderColor: Colors.gold, backgroundColor: '#2C1F08' },

  progressTrack: { width: '100%', height: 3, backgroundColor: Colors.border, borderRadius: 2, marginBottom: Spacing.xl, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 2 },

  verifyBtn: { width: '100%', borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  verifyText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.lg, color: Colors.bg },

  resendRow: { alignItems: 'center' },
  resendTimer: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.sm, color: Colors.textMuted },
  resendLink: { fontFamily: 'Cairo_700Bold', fontSize: FontSize.sm, color: Colors.gold },

  successOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: Colors.bg + 'F0',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  successIcon: { fontSize: 72, marginBottom: Spacing.md },
  successText: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xxxl, color: Colors.gold },
});

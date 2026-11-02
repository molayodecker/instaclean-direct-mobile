import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ContentColumn } from '@/components/ui/ContentColumn';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/context/AuthContext';
import { fetchAuthMethods } from '@/lib/mithril';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

export default function SignInScreen() {
  const { formMaxWidth, isTablet } = useResponsiveLayout();
  const { signInWithEmail, requestOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState({ email_password: true, phone: false });

  useEffect(() => {
    fetchAuthMethods()
      .then((response) => {
        setMethods({
          email_password: response.methods?.email_password ?? true,
          phone: response.methods?.phone ?? false,
        });
      })
      .catch(() => {
        // Keep defaults when Mithril methods endpoint is unreachable.
      });
  }, []);

  const handleEmailSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestOtp(phone.trim());
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ContentColumn maxWidth={formMaxWidth} flex style={{ flex: 1, justifyContent: isTablet ? 'center' : 'flex-start' }}>
        <View style={styles.container}>
        <View style={styles.logo}>
          <Ionicons name="home" size={32} color={theme.colors.accentText} />
        </View>
        <AppText variant="title" style={styles.heading}>Instaclean Admin</AppText>
        <AppText variant="caption" style={styles.sub}>
          Sign in with your team account. Admin access is checked on every request.
        </AppText>

        <View style={styles.tabs}>
          {methods.email_password && (
            <Pressable
              onPress={() => setTab('email')}
              style={[styles.tab, tab === 'email' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'email' && styles.tabTextActive]}>Email</Text>
            </Pressable>
          )}
          {methods.phone && (
            <Pressable
              onPress={() => setTab('phone')}
              style={[styles.tab, tab === 'phone' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}>Phone OTP</Text>
            </Pressable>
          )}
        </View>

        {tab === 'email' ? (
          <>
            <AppText variant="label">Email</AppText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@tryinstaclean.com"
              placeholderTextColor={theme.colors.textDim}
            />
            <AppText variant="label">Password</AppText>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={theme.colors.textDim}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <Button label={loading ? 'Signing in…' : 'Sign in'} onPress={handleEmailSignIn} style={styles.signInBtn} />
          </>
        ) : (
          <>
            <AppText variant="label">Phone</AppText>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+233…"
              placeholderTextColor={theme.colors.textDim}
              keyboardType="phone-pad"
            />
            {otpSent && (
              <>
                <AppText variant="label">Verification code</AppText>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  placeholder="6-digit code"
                  placeholderTextColor={theme.colors.textDim}
                />
              </>
            )}
            <Button
              label={loading ? 'Please wait…' : otpSent ? 'Verify & sign in' : 'Send code'}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              style={styles.signInBtn}
            />
          </>
        )}

        {error && <AppText variant="caption" style={styles.error}>{error}</AppText>}

        <Text style={styles.footer}>
          Need access? Ask your owner to invite you, then grant admin with mix mithril.staff.grant.
        </Text>
        </View>
      </ContentColumn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingVertical: theme.spacing.xl, width: '100%' },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  heading: { marginBottom: theme.spacing.sm },
  sub: { marginBottom: theme.spacing.xl, lineHeight: 20 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.radius.sm },
  tabActive: { backgroundColor: theme.colors.backgroundElevated },
  tabText: { color: theme.colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: theme.colors.accent },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eye: { position: 'absolute', right: 14, top: 14 },
  signInBtn: { marginTop: theme.spacing.sm },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md, textAlign: 'center' },
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: theme.spacing.xxl,
    lineHeight: 18,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});

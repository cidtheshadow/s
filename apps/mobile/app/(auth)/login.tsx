import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

  const handleSendOtp = async () => {
    setErrorMsg('');
    const rawNumber = phone.replace(/\D/g, '');
    if (rawNumber.length < 10) {
      setErrorMsg(t('invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setOtpSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    if (otp.trim().length !== 6) {
      setErrorMsg(t('invalidOtp'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms'
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.replace('/(farmer)/home');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{otpSent ? t('enterOtp') : t('phoneLogin')}</Text>
        <Text style={styles.subtitle}>
          {otpSent ? t('otpSubtitle', { phone: formattedPhone }) : t('phoneSubtitle')}
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {!otpSent ? (
          <View style={styles.inputContainer}>
            <Text style={styles.prefixText}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
          </View>
        ) : (
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={otpSent ? handleVerifyOtp : handleSendOtp}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {otpSent ? t('verifyOtp') : t('sendOtp')}
            </Text>
          )}
        </TouchableOpacity>

        {otpSent && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setOtpSent(false);
              setOtp('');
              setErrorMsg('');
            }}
          >
            <Text style={styles.secondaryButtonText}>← {t('phoneLogin')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F5132',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 20
  },
  prefixText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    marginRight: 8
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 18,
    color: '#111827',
    fontWeight: '600'
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    letterSpacing: 6,
    fontSize: 22,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#0F5132',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: '600'
  }
});

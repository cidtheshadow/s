import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@kisanify/shared';
import { supabase } from '../src/lib/supabase';

export default function IndexScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'hi');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(farmer)/home');
      } else {
        setCheckingAuth(false);
      }
    });
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    i18n.changeLanguage(langCode);
  };

  const handleContinue = () => {
    router.push('/(auth)/login');
  };

  if (checkingAuth) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Kisanify loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.badgeText}>SIH 2026 • SIH26032</Text>
        <Text style={styles.appTitle}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>{t('selectLanguage')}</Text>
        <View style={styles.langGrid}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={[
                  styles.langButton,
                  isSelected && styles.langButtonSelected
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.langLabel,
                    isSelected && styles.langLabelSelected
                  ]}
                >
                  {lang.label}
                </Text>
                <Text
                  style={[
                    styles.langSubLabel,
                    isSelected && styles.langSubLabelSelected
                  ]}
                >
                  {lang.englishName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>{t('continue')} →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    fontSize: 16,
    color: '#0F5132',
    fontWeight: '600'
  },
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: 24
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F5132',
    letterSpacing: -0.5
  },
  tagline: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center'
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  langButton: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center'
  },
  langButtonSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  langLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  langLabelSelected: {
    color: '#0F5132'
  },
  langSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  langSubLabelSelected: {
    color: '#198754'
  },
  continueButton: {
    marginTop: 24,
    backgroundColor: '#0F5132',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  }
});

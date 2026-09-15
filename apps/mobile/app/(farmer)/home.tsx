import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../src/lib/supabase';

export default function FarmerHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserPhone(user.phone || 'Farmer');
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeBadge}>Kisanify Portal</Text>
        <Text style={styles.welcomeTitle}>{t('welcome', { name: userPhone || 'Kisan' })}</Text>
        <Text style={styles.welcomeSubtitle}>Smart India Hackathon 2026 Procurement Hub</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(farmer)/centres')}
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>{t('bookSlot')}</Text>
          <Text style={styles.cardDesc}>Schedule mandi arrival & get instant QR token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(farmer)/queue')}
        >
          <Text style={styles.cardIcon}>⏳</Text>
          <Text style={styles.cardTitle}>{t('liveQueue')}</Text>
          <Text style={styles.cardDesc}>Real-time token position & estimated wait time</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(farmer)/prices')}
        >
          <Text style={styles.cardIcon}>📈</Text>
          <Text style={styles.cardTitle}>{t('marketPrices')}</Text>
          <Text style={styles.cardDesc}>Live MSP comparison & 7-day price trends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(farmer)/grievance')}
        >
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={styles.cardTitle}>{t('fileGrievance')}</Text>
          <Text style={styles.cardDesc}>Track issues with mandi officers or payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { width: '100%', backgroundColor: '#E8F5E9', borderColor: '#A3E635' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(farmer)/assistant')}
        >
          <Text style={styles.cardIcon}>🤖</Text>
          <Text style={styles.cardTitle}>AI Kisan Assistant | AI सहायक</Text>
          <Text style={styles.cardDesc}>Ask queue wait time, MSP rates & mandi queries in your language</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  welcomeCard: {
    backgroundColor: '#0F5132',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  welcomeBadge: {
    color: '#E8F5E9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6
  },
  welcomeSubtitle: {
    color: '#A3E635',
    fontSize: 14,
    marginTop: 4
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24
  },
  menuCard: {
    width: '47%',
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16
  }
});

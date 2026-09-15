import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../src/lib/api';

interface CentreItem {
  id: string;
  name: string;
  district: string;
  state: string;
  daily_capacity: number;
  operating_hours: { start: string; end: string };
  available_slots_count?: number;
  avg_wait_minutes?: number;
  distance_km?: number;
}

export default function CentresScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [centres, setCentres] = useState<CentreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const data = await apiFetch<CentreItem[]>('/centres');
      // Enrich centres with estimated distance and slot availability mock calculations
      const enriched = data.map((c, index) => ({
        ...c,
        distance_km: Number((4.2 + index * 6.5).toFixed(1)),
        available_slots_count: Math.max(12, c.daily_capacity - (25 + index * 15)),
        avg_wait_minutes: 15 + index * 10
      }));
      setCentres(enriched);
    } catch (err: any) {
      setError(err.message || 'Failed to load procurement centres');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCentre = (centreId: string) => {
    router.push({
      pathname: '/(farmer)/book-slot',
      params: { centreId }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Procurement Centres | खरीद केंद्र</Text>
        <Text style={styles.subtitle}>Select a nearby government mandi centre to book your slot</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {centres.map((centre) => (
            <TouchableOpacity
              key={centre.id}
              style={styles.card}
              onPress={() => handleSelectCentre(centre.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.centreName}>{centre.name}</Text>
                  <Text style={styles.locationText}>📍 {centre.district}, {centre.state}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{centre.distance_km} km away</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Available Slots Today</Text>
                  <Text style={styles.statValueGreen}>{centre.available_slots_count} slots</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Avg Wait Time</Text>
                  <Text style={styles.statValueAmber}>~{centre.avg_wait_minutes} mins</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Daily Capacity</Text>
                  <Text style={styles.statValue}>{centre.daily_capacity} qtl</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.hoursText}>🕒 Hours: {centre.operating_hours?.start || '09:00'} - {centre.operating_hours?.end || '17:00'}</Text>
                <Text style={styles.bookActionText}>Book Slot →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F5132'
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600'
  },
  list: {
    gap: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  centreName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2
  },
  distanceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5132'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  statBox: {
    alignItems: 'flex-start'
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2
  },
  statValueGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F5132',
    marginTop: 2
  },
  statValueAmber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  hoursText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },
  bookActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132'
  }
});

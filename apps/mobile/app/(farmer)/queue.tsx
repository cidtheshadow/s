import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../src/lib/supabase';
import { apiFetch } from '../../src/lib/api';

export default function LiveQueueScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [queuePos, setQueuePos] = useState<number>(4);
  const [peopleAhead, setPeopleAhead] = useState<number>(3);
  const [estWaitMins, setEstWaitMins] = useState<number>(36);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadActiveQueue();
  }, []);

  const loadActiveQueue = async () => {
    try {
      const bookings = await apiFetch<any[]>('/bookings/my-bookings');
      if (bookings && bookings.length > 0) {
        const latest = bookings[0];
        setActiveBooking(latest);
        if (latest.queue) {
          setQueuePos(latest.queue.position || 4);
          setPeopleAhead(Math.max(0, (latest.queue.position || 4) - 1));
          setEstWaitMins(latest.queue.estimated_wait_minutes || 36);
        }
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup Supabase Realtime subscription with 30s fallback polling
  useEffect(() => {
    if (!activeBooking) return;

    // Realtime listener
    const channel = supabase
      .channel(`queue_centre_${activeBooking.centre_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `booking_id=eq.${activeBooking.id}`
      }, (payload) => {
        setIsLive(true);
        if (payload.new) {
          const entry = payload.new as any;
          setQueuePos(entry.position);
          setPeopleAhead(Math.max(0, entry.position - 1));
          setEstWaitMins(entry.estimated_wait_minutes);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsLive(false);
        }
      });

    // Graceful fallback polling every 30 seconds
    const interval = setInterval(() => {
      loadActiveQueue();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeBooking]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
      ) : !activeBooking ? (
        <View style={styles.card}>
          <Text style={styles.noQueueText}>No Active Mandi Booking Found</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push('/(farmer)/centres')}
          >
            <Text style={styles.bookButtonText}>Book Mandi Slot Now →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.liveHeader}>
            <View style={styles.badgeRow}>
              <View style={[styles.pulseDot, isLive ? styles.pulseDotGreen : styles.pulseDotAmber]} />
              <Text style={styles.liveText}>
                {isLive ? 'LIVE REALTIME QUEUE' : 'POLLING (30s)'}
              </Text>
            </View>
            <Text style={styles.tokenText}>Token: #{activeBooking.token_number}</Text>
          </View>

          <Text style={styles.centreTitle}>{activeBooking.centre?.name || 'Grain Mandi'}</Text>
          <Text style={styles.cropInfo}>Crop: {activeBooking.crop} • {activeBooking.expected_quantity_qtl} qtl</Text>

          <View style={styles.heroQueueBox}>
            <Text style={styles.heroLabel}>YOUR QUEUE POSITION</Text>
            <Text style={styles.heroPosition}>#{queuePos}</Text>
            <View style={styles.heroSubRow}>
              <View style={styles.heroSubItem}>
                <Text style={styles.subItemValue}>{peopleAhead}</Text>
                <Text style={styles.subItemLabel}>People Ahead</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.heroSubItem}>
                <Text style={styles.subItemValue}>~{estWaitMins}m</Text>
                <Text style={styles.subItemLabel}>Est. Wait Time</Text>
              </View>
            </View>
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>💡 Mandi Arrival Instructions:</Text>
            <Text style={styles.instructionText}>• Keep your Token QR ready at the entrance gate.</Text>
            <Text style={styles.instructionText}>• Bring moisture test report or get quality check done at Bay 2.</Text>
            <Text style={styles.instructionText}>• SMS alert will be sent when your turn is 15 minutes away.</Text>
          </View>

          <TouchableOpacity
            style={styles.statusPipelineButton}
            onPress={() => router.push({ pathname: '/(farmer)/status', params: { bookingId: activeBooking.id } })}
          >
            <Text style={styles.statusPipelineButtonText}>View Status Pipeline Stepper →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  noQueueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginVertical: 20
  },
  bookButton: {
    backgroundColor: '#0F5132',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  pulseDotGreen: {
    backgroundColor: '#10B981'
  },
  pulseDotAmber: {
    backgroundColor: '#F59E0B'
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F5132',
    letterSpacing: 0.5
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  centreTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },
  cropInfo: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2
  },
  heroQueueBox: {
    backgroundColor: '#0F5132',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20
  },
  heroLabel: {
    color: '#A3E635',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  heroPosition: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    marginVertical: 4
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%'
  },
  heroSubItem: {
    flex: 1,
    alignItems: 'center'
  },
  subItemValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800'
  },
  subItemLabel: {
    color: '#E8F5E9',
    fontSize: 12,
    marginTop: 2
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  instructionsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6
  },
  instructionText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18
  },
  statusPipelineButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  statusPipelineButtonText: {
    color: '#0F5132',
    fontSize: 15,
    fontWeight: '700'
  }
});

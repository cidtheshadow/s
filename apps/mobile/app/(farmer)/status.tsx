import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookingStatus, BOOKING_STATUS_ORDER } from '@kisanify/shared';
import { apiFetch } from '../../src/lib/api';

const PIPELINE_STEPS: { status: BookingStatus; label: string; desc: string; icon: string }[] = [
  { status: 'BOOKED', label: 'Slot Booked', desc: 'Mandi slot & token generated', icon: '📅' },
  { status: 'ARRIVED', label: 'Gate Arrival', desc: 'Checked in at mandi gate', icon: '🚚' },
  { status: 'QUALITY_CHECKED', label: 'Quality Check', desc: 'Moisture % & grain grade verified', icon: '🔬' },
  { status: 'PROCURED', label: 'Procured & Weighed', desc: 'Grain accepted into government warehouse', icon: '⚖️' },
  { status: 'PAYMENT_INITIATED', label: 'Payment Initiated', desc: 'DBT advice sent to treasury', icon: '💳' },
  { status: 'PAID', label: 'Payment Credited', desc: 'MSP funds transferred to bank account', icon: '✅' }
];

export default function StatusPipelineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingStatus();
  }, [params.bookingId]);

  const fetchBookingStatus = async () => {
    try {
      if (params.bookingId) {
        const data = await apiFetch<any>(`/bookings/${params.bookingId}`);
        setBooking(data);
      } else {
        const myBookings = await apiFetch<any[]>('/bookings/my-bookings');
        if (myBookings && myBookings.length > 0) {
          setBooking(myBookings[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F5132" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No active booking found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(farmer)/centres')}>
          <Text style={styles.backBtnText}>Book a Slot</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStatus: BookingStatus = booking.status || 'BOOKED';
  const currentRank = BOOKING_STATUS_ORDER[currentStatus] || 1;

  // Build event timestamp map
  const eventsMap = new Map<string, string>();
  (booking.events || []).forEach((ev: any) => {
    eventsMap.set(ev.status, new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenBadge}>TOKEN: #{booking.token_number}</Text>
          <Text style={styles.dateText}>{new Date(booking.created_at).toLocaleDateString()}</Text>
        </View>

        <Text style={styles.centreName}>{booking.centre?.name || 'Mandi Procurement Centre'}</Text>
        <Text style={styles.cropDetail}>{booking.crop} • {booking.expected_quantity_qtl} Quintals</Text>
      </View>

      {/* Signature Visual Stepper Card */}
      <View style={styles.stepperCard}>
        <Text style={styles.stepperTitle}>Procurement Status Pipeline</Text>
        <Text style={styles.stepperSubtitle}>Real-time 6-stage government procurement tracking</Text>

        <View style={styles.timeline}>
          {PIPELINE_STEPS.map((step, index) => {
            const stepRank = BOOKING_STATUS_ORDER[step.status];
            const isCompleted = stepRank < currentRank || currentStatus === 'PAID';
            const isCurrent = currentStatus === step.status && currentStatus !== 'PAID';
            const isPending = stepRank > currentRank;
            const timestamp = eventsMap.get(step.status);

            return (
              <View key={step.status} style={styles.timelineStep}>
                <View style={styles.leftCol}>
                  <View
                    style={[
                      styles.circle,
                      isCompleted && styles.circleCompleted,
                      isCurrent && styles.circleCurrent,
                      isPending && styles.circlePending
                    ]}
                  >
                    <Text style={styles.stepIcon}>
                      {isCompleted ? '✓' : step.icon}
                    </Text>
                  </View>
                  {index < PIPELINE_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        stepRank < currentRank && styles.connectorCompleted
                      ]}
                    />
                  )}
                </View>

                <View style={[styles.rightCol, isCurrent && styles.activeCardHighlight]}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>
                      {index + 1}. {step.label}
                    </Text>
                    {timestamp ? (
                      <Text style={styles.timestampBadge}>{timestamp}</Text>
                    ) : isCurrent ? (
                      <Text style={styles.inProgressBadge}>IN PROGRESS</Text>
                    ) : null}
                  </View>

                  <Text style={styles.stepDesc}>{step.desc}</Text>

                  {isCurrent && (
                    <View style={styles.liveIndicatorRow}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.liveIndicatorText}>Awaiting officer signoff</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600'
  },
  backBtn: {
    marginTop: 12,
    backgroundColor: '#0F5132',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  headerCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0F5132',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenBadge: {
    backgroundColor: '#A3E635',
    color: '#0A3622',
    fontWeight: '900',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  dateText: {
    color: '#E8F5E9',
    fontSize: 12,
    fontWeight: '600'
  },
  centreName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12
  },
  cropDetail: {
    color: '#E8F5E9',
    fontSize: 14,
    marginTop: 4
  },
  stepperCard: {
    width: '100%',
    maxWidth: 500,
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
  stepperTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  stepperSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 20
  },
  timeline: {
    paddingLeft: 4
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20
  },
  leftCol: {
    alignItems: 'center',
    marginRight: 14
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  circleCompleted: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132'
  },
  circleCurrent: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706'
  },
  circlePending: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB'
  },
  stepIcon: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '800'
  },
  connector: {
    width: 3,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4
  },
  connectorCompleted: {
    backgroundColor: '#0F5132'
  },
  rightCol: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  activeCardHighlight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D'
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151'
  },
  stepLabelCurrent: {
    color: '#92400E',
    fontWeight: '800'
  },
  timestampBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  inProgressBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  stepDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706'
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309'
  }
});

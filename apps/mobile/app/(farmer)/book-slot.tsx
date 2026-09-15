import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CROPS_LIST } from '@kisanify/shared';
import { apiFetch } from '../../src/lib/api';

interface SlotItem {
  id: string;
  centre_id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
}

export default function BookSlotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ centreId: string }>();
  const centreId = params.centreId || '11111111-1111-1111-1111-111111111111';

  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat (गेहूं)');
  const [quantityQtl, setQuantityQtl] = useState<string>('50');

  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [centreId]);

  const fetchSlots = async () => {
    try {
      const data = await apiFetch<SlotItem[]>(`/centres/${centreId}/slots`);
      setSlots(data || []);
      if (data && data.length > 0) {
        setSelectedSlotId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    setError('');
    if (!selectedSlotId) {
      setError('Please select an available slot time');
      return;
    }

    const qty = parseFloat(quantityQtl);
    if (!qty || qty <= 0) {
      setError('Please enter a valid expected crop quantity in quintals');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await apiFetch<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          centre_id: centreId,
          slot_id: selectedSlotId,
          crop: selectedCrop,
          expected_quantity_qtl: qty
        })
      });

      // Redirect to booking status screen
      router.push({
        pathname: '/(farmer)/status',
        params: { bookingId: booking.id }
      });
    } catch (err: any) {
      setError(err.message || 'Slot booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Book Procurement Slot | स्लॉट बुक करें</Text>
        <Text style={styles.subtitle}>Choose time window and crop details for your mandi visit</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Select Crop / फसल चुनें *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropScroll}>
            {CROPS_LIST.map((crop) => {
              const isSelected = selectedCrop === crop;
              return (
                <TouchableOpacity
                  key={crop}
                  onPress={() => setSelectedCrop(crop)}
                  style={[styles.cropChip, isSelected && styles.cropChipSelected]}
                >
                  <Text style={[styles.cropText, isSelected && styles.cropTextSelected]}>
                    {crop}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expected Quantity (Quintals / क्विंटल) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 50"
            value={quantityQtl}
            onChangeText={setQuantityQtl}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Available Time Windows / उपलब्ध स्लॉट *</Text>

          {loadingSlots ? (
            <ActivityIndicator color="#0F5132" style={{ marginVertical: 20 }} />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No slots remaining for today. Please check back tomorrow.</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const remaining = slot.capacity - slot.booked_count;
                const isSelected = selectedSlotId === slot.id;
                const isFull = remaining <= 0;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={isFull}
                    onPress={() => setSelectedSlotId(slot.id)}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardSelected,
                      isFull && styles.slotCardFull
                    ]}
                  >
                    <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                      ⏰ {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </Text>
                    <Text style={styles.slotDate}>{slot.date}</Text>
                    <Text
                      style={[
                        styles.capacityBadge,
                        remaining > 5 ? styles.greenCap : remaining > 0 ? styles.amberCap : styles.redCap
                      ]}
                    >
                      {isFull ? 'FULL' : `${remaining} slots left`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, (submitting || !selectedSlotId) && styles.buttonDisabled]}
          onPress={handleConfirmBooking}
          disabled={submitting || !selectedSlotId}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Slot Booking & Generate Token →</Text>
          )}
        </TouchableOpacity>
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
  card: {
    width: '100%',
    maxWidth: 520,
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
    marginTop: 4,
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
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827'
  },
  cropScroll: {
    gap: 8,
    paddingVertical: 4
  },
  cropChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB'
  },
  cropChipSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  cropText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600'
  },
  cropTextSelected: {
    color: '#0F5132',
    fontWeight: '800'
  },
  noSlotsText: {
    fontSize: 14,
    color: '#DC2626',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  slotCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  slotCardSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  slotCardFull: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6'
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827'
  },
  slotTimeSelected: {
    color: '#0F5132'
  },
  slotDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  capacityBadge: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    alignSelf: 'flex-start'
  },
  greenCap: {
    color: '#0F5132'
  },
  amberCap: {
    color: '#D97706'
  },
  redCap: {
    color: '#DC2626'
  },
  confirmButton: {
    backgroundColor: '#0F5132',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    opacity: 0.7
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { BookingStatus, BOOKING_STATUS_ORDER } from '@kisanify/shared';
import { apiFetch } from '../../src/lib/api';

export default function OfficerDashboardScreen() {
  const router = useRouter();

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');

  // Quality check modal state
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [moisture, setMoisture] = useState('11.5');
  const [foreignMatter, setForeignMatter] = useState('1.2');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'REJECTED'>('A');
  const [reason, setReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOfficerQueue();
  }, []);

  const fetchOfficerQueue = async () => {
    try {
      const data = await apiFetch<any[]>('/officer/queue');
      setQueue(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch officer queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (token?: string) => {
    const targetToken = token || tokenInput;
    if (!targetToken) return;

    setError('');
    setMsg('');
    setActionLoading(true);

    try {
      const res = await apiFetch<any>('/officer/check-in', {
        method: 'POST',
        body: JSON.stringify({ token_number: targetToken })
      });
      setMsg(res.message);
      setTokenInput('');
      fetchOfficerQueue();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openQualityCheckModal = (booking: any) => {
    setSelectedBooking(booking);
    setMoisture('11.5');
    setForeignMatter('1.2');
    setGrade('A');
    setReason('');
    setQcModalOpen(true);
  };

  const handleSaveQualityCheck = async () => {
    if (!selectedBooking) return;
    setError('');
    setMsg('');
    setActionLoading(true);

    try {
      await apiFetch('/officer/quality-check', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          moisture_pct: parseFloat(moisture) || 12.0,
          foreign_matter_pct: parseFloat(foreignMatter) || 1.0,
          grade,
          reason
        })
      });
      setMsg(`Quality inspection recorded for Token #${selectedBooking.token_number}`);
      setQcModalOpen(false);
      fetchOfficerQueue();
    } catch (err: any) {
      setError(err.message || 'Quality check submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    setError('');
    setMsg('');
    setActionLoading(true);

    try {
      await apiFetch('/officer/advance-status', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: bookingId,
          status: nextStatus
        })
      });
      setMsg(`Status updated to ${nextStatus}`);
      fetchOfficerQueue();
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.badge}>Procurement Officer Portal</Text>
          <Text style={styles.centreName}>Khanna Grain Mandi (Centre #1)</Text>
        </View>

        {msg ? (
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>{msg}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Quick QR / Token Check-In Bar */}
        <View style={styles.checkInCard}>
          <Text style={styles.checkInTitle}>⚡ Gate Entry & Token Check-In</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Scan QR or Enter Token (e.g. KS-2026-9821)"
              value={tokenInput}
              onChangeText={setTokenInput}
            />
            <TouchableOpacity
              style={styles.checkInBtn}
              onPress={() => handleCheckIn()}
              disabled={actionLoading}
            >
              <Text style={styles.checkInBtnText}>Check In →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Queue Entries Table / List */}
      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Today's Mandi Queue ({queue.length} Farmers)</Text>
          <TouchableOpacity onPress={fetchOfficerQueue}>
            <Text style={styles.refreshText}>🔄 Refresh Queue</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#0F5132" style={{ marginVertical: 30 }} />
        ) : queue.length === 0 ? (
          <Text style={styles.emptyText}>No bookings queued for today.</Text>
        ) : (
          <View style={styles.queueGrid}>
            {queue.map((item) => {
              const currentStatus: BookingStatus = item.status;
              const rank = BOOKING_STATUS_ORDER[currentStatus];

              return (
                <View key={item.id} style={styles.queueCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.tokenTag}>TOKEN: #{item.token_number}</Text>
                    <Text style={styles.statusTag}>{item.status}</Text>
                  </View>

                  <Text style={styles.farmerName}>{item.farmer?.name || 'Farmer'} ({item.farmer?.phone || ''})</Text>
                  <Text style={styles.detailsText}>Crop: {item.crop} • {item.expected_quantity_qtl} qtl • {item.farmer?.village || 'Mandi'}</Text>

                  {/* 1-Tap Action Stepper Buttons */}
                  <View style={styles.actionsRow}>
                    {currentStatus === 'BOOKED' && (
                      <TouchableOpacity
                        style={styles.actionBtnCheckIn}
                        onPress={() => handleCheckIn(item.token_number)}
                      >
                        <Text style={styles.actionBtnText}>Check In Farmer</Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'ARRIVED' && (
                      <TouchableOpacity
                        style={styles.actionBtnQc}
                        onPress={() => openQualityCheckModal(item)}
                      >
                        <Text style={styles.actionBtnText}>Quality Inspection Form</Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'QUALITY_CHECKED' && (
                      <TouchableOpacity
                        style={styles.actionBtnProcure}
                        onPress={() => handleAdvanceStatus(item.id, 'PROCURED')}
                      >
                        <Text style={styles.actionBtnText}>Mark Procured & Weighed</Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'PROCURED' && (
                      <TouchableOpacity
                        style={styles.actionBtnPayment}
                        onPress={() => handleAdvanceStatus(item.id, 'PAYMENT_INITIATED')}
                      >
                        <Text style={styles.actionBtnText}>Trigger Payment</Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'PAYMENT_INITIATED' && (
                      <TouchableOpacity
                        style={styles.actionBtnPaid}
                        onPress={() => handleAdvanceStatus(item.id, 'PAID')}
                      >
                        <Text style={styles.actionBtnText}>Mark Paid (DBT)</Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'PAID' && (
                      <Text style={styles.completedTag}>✓ Complete & Paid</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Quality Check Inspection Modal */}
      <Modal visible={qcModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔬 Quality Inspection Form</Text>
            <Text style={styles.modalSubtitle}>Token #{selectedBooking?.token_number} • {selectedBooking?.crop}</Text>

            <View style={styles.field}>
              <Text style={styles.modalLabel}>Moisture % (Standard &lt; 12.0%)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="decimal-pad"
                value={moisture}
                onChangeText={setMoisture}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.modalLabel}>Foreign Matter / Impurity % (Standard &lt; 1.5%)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="decimal-pad"
                value={foreignMatter}
                onChangeText={setForeignMatter}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.modalLabel}>Grain Grade Decision</Text>
              <View style={styles.gradeGrid}>
                {(['A', 'B', 'C', 'REJECTED'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGrade(g)}
                    style={[styles.gradeChip, grade === g && styles.gradeChipSelected]}
                  >
                    <Text style={[styles.gradeText, grade === g && styles.gradeTextSelected]}>
                      Grade {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.modalLabel}>Remarks / Reason</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Optional inspection notes..."
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setQcModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveQualityCheck}
                disabled={actionLoading}
              >
                <Text style={styles.saveBtnText}>Save Quality Inspection →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  titleRow: {
    marginBottom: 12
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  centreName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4
  },
  msgBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  msgText: {
    color: '#0F5132',
    fontWeight: '700'
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700'
  },
  checkInCard: {
    backgroundColor: '#0F5132',
    borderRadius: 14,
    padding: 18
  },
  checkInTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15
  },
  checkInBtn: {
    backgroundColor: '#A3E635',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkInBtnText: {
    color: '#0A3622',
    fontWeight: '900',
    fontSize: 15
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  refreshText: {
    fontSize: 13,
    color: '#0F5132',
    fontWeight: '700'
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20
  },
  queueGrid: {
    gap: 12
  },
  queueCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenTag: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F5132'
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6
  },
  detailsText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2
  },
  actionsRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  actionBtnCheckIn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnQc: {
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnProcure: {
    backgroundColor: '#0F5132',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnPayment: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnPaid: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  completedTag: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16
  },
  field: {
    marginBottom: 14
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6
  },
  modalInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15
  },
  gradeGrid: {
    flexDirection: 'row',
    gap: 8
  },
  gradeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center'
  },
  gradeChipSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151'
  },
  gradeTextSelected: {
    color: '#0F5132'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
});

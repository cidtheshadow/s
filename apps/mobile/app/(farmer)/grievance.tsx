import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../src/lib/api';

const CATEGORIES = [
  { key: 'SLOT_DELAY', label: 'Slot Delay / কাতার বিলম্ব' },
  { key: 'QUALITY_DISPUTE', label: 'Quality Check Dispute / गुणवत्ता विवाद' },
  { key: 'PAYMENT_DELAY', label: 'Payment Transfer Delay / भुगतान देरी' },
  { key: 'OFFICER_BEHAVIOR', label: 'Mandi Officer Behavior / शिकायत' },
  { key: 'OTHER', label: 'Other / अन्य' }
];

export default function GrievanceScreen() {
  const { t } = useTranslation();

  const [category, setCategory] = useState('SLOT_DELAY');
  const [description, setDescription] = useState('');
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyGrievances();
  }, []);

  const fetchMyGrievances = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>('/grievances/my-grievances');
      setGrievances(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setMsg('');

    if (description.trim().length < 10) {
      setError('Please describe your issue in at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/grievances', {
        method: 'POST',
        body: JSON.stringify({
          category,
          description
        })
      });

      setMsg('Grievance ticket filed successfully! Mandi officer SLA timer started.');
      setDescription('');
      fetchMyGrievances();
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>File Grievance | शिकायत दर्ज करें</Text>
        <Text style={styles.subtitle}>Report issues with slot delays, quality grading, or payments</Text>

        {msg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{msg}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Grievance Category / श्रेणी *</Text>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[styles.radioItem, isSelected && styles.radioItemSelected]}
              >
                <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                  {isSelected ? '🔘 ' : '⚪ '}{cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Issue Description / विवरण *</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Describe your issue in detail..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Grievance Ticket →</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.title}>Your Filed Tickets ({grievances.length})</Text>

        {loading ? (
          <ActivityIndicator color="#0F5132" style={{ marginVertical: 20 }} />
        ) : grievances.length === 0 ? (
          <Text style={styles.noTicketsText}>No grievances filed yet.</Text>
        ) : (
          <View style={styles.ticketList}>
            {grievances.map((g) => (
              <View key={g.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.categoryBadge}>{g.category}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      g.status === 'RESOLVED' ? styles.greenStatus : styles.amberStatus
                    ]}
                  >
                    {g.status}
                  </Text>
                </View>
                <Text style={styles.ticketDesc}>{g.description}</Text>
                <Text style={styles.ticketDate}>Filed: {new Date(g.created_at).toLocaleString()}</Text>
                {g.resolution && (
                  <View style={styles.resolutionBox}>
                    <Text style={styles.resolutionText}>Resolution: {g.resolution}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132'
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    marginBottom: 20
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  successText: {
    color: '#0F5132',
    fontWeight: '700',
    fontSize: 13
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13
  },
  field: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8
  },
  radioItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 8
  },
  radioItemSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600'
  },
  radioTextSelected: {
    color: '#0F5132',
    fontWeight: '700'
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    minHeight: 90,
    textAlignVertical: 'top'
  },
  submitBtn: {
    backgroundColor: '#0F5132',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  btnDisabled: {
    opacity: 0.7
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  noTicketsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginVertical: 10
  },
  ticketList: {
    gap: 12,
    marginTop: 12
  },
  ticketCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827'
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  greenStatus: {
    backgroundColor: '#E8F5E9',
    color: '#0F5132'
  },
  amberStatus: {
    backgroundColor: '#FEF3C7',
    color: '#D97706'
  },
  ticketDesc: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 6
  },
  ticketDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6
  },
  resolutionBox: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6
  },
  resolutionText: {
    fontSize: 12,
    color: '#0F5132',
    fontWeight: '600'
  }
});

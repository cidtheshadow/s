import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { apiFetch } from '../../src/lib/api';

interface AdminStats {
  overview: {
    total_centres: number;
    total_bookings: number;
    procured_bookings: number;
    no_show_rate_pct: number;
    open_grievances: number;
  };
  centre_stats: {
    id: string;
    name: string;
    district: string;
    daily_capacity: number;
    booked_today: number;
    procured_qtl: number;
    avg_wait_minutes: number;
    capacity_utilized_pct: number;
  }[];
}

interface GrievanceItem {
  id: string;
  category: string;
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
  farmer?: { name: string; phone: string; village: string };
  sla: {
    target_hours: number;
    elapsed_hours: number;
    remaining_hours: number;
    is_breached: boolean;
  };
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Resolution modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<GrievanceItem | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [sData, gData] = await Promise.all([
        apiFetch<AdminStats>('/admin/stats'),
        apiFetch<GrievanceItem[]>('/admin/grievances')
      ]);
      setStats(sData);
      setGrievances(gData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveGrievance = async () => {
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      await apiFetch(`/admin/grievances/${selectedTicket.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution: resolutionInput })
      });
      setResolveModalOpen(false);
      setResolutionInput('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve grievance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F5132" />
      </View>
    );
  }

  const overview = stats?.overview || {
    total_centres: 5,
    total_bookings: 184,
    procured_bookings: 142,
    no_show_rate_pct: 4.2,
    open_grievances: 3
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>State Executive Admin Control Room</Text>
        <Text style={styles.title}>Procurement Operations & Capacity Planning</Text>
        <Text style={styles.subtitle}>Smart India Hackathon 2026 • Live Monitoring</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Overview Stat Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Centres</Text>
          <Text style={styles.statValue}>{overview.total_centres}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Bookings Today</Text>
          <Text style={styles.statValueGreen}>{overview.total_bookings}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Procured Count</Text>
          <Text style={styles.statValue}>{overview.procured_bookings}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>No-Show Rate</Text>
          <Text style={styles.statValueAmber}>{overview.no_show_rate_pct}%</Text>
        </View>
      </View>

      {/* Centre-wise Throughput Table */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Centre-wise Capacity vs Demand Load</Text>
        <Text style={styles.cardSubtitle}>Real-time throughput, wait time, and capacity utilization</Text>

        <View style={styles.table}>
          {(stats?.centre_stats || []).map((c) => (
            <View key={c.id} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.centreName}>{c.name}</Text>
                <Text style={styles.centreSub}>{c.district} • Cap: {c.daily_capacity} qtl</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.colVal}>{c.booked_today} slots</Text>
                <Text style={styles.colSub}>Demand</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.colValGreen}>~{c.avg_wait_minutes}m</Text>
                <Text style={styles.colSub}>Avg Wait</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.barWrap}>
                  <View style={[styles.barFill, { width: `${c.capacity_utilized_pct}%` }]} />
                </View>
                <Text style={styles.colSub}>{c.capacity_utilized_pct}% Load</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Grievances Queue with SLA Timers */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>Grievance Queue & SLA Compliance</Text>
          <Text style={styles.slaBadge}>24-Hour SLA Target</Text>
        </View>

        {grievances.length === 0 ? (
          <Text style={styles.emptyText}>No pending grievances.</Text>
        ) : (
          <View style={styles.grievanceGrid}>
            {grievances.map((g) => (
              <View key={g.id} style={styles.grievanceCard}>
                <View style={styles.gHeader}>
                  <Text style={styles.gCategory}>{g.category}</Text>
                  <View style={[styles.slaTag, g.sla?.is_breached ? styles.slaBreached : styles.slaOk]}>
                    <Text style={[styles.slaText, g.sla?.is_breached ? styles.slaTextBreached : styles.slaTextOk]}>
                      {g.sla?.is_breached ? '🚨 SLA BREACHED' : `⏱ ${g.sla?.remaining_hours}h left`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.gDesc}>{g.description}</Text>
                <Text style={styles.gFarmer}>Farmer: {g.farmer?.name || 'Kisan'} ({g.farmer?.phone || ''}) • {g.farmer?.village || ''}</Text>

                {g.status === 'OPEN' ? (
                  <TouchableOpacity
                    style={styles.resolveBtn}
                    onPress={() => {
                      setSelectedTicket(g);
                      setResolutionInput('');
                      setResolveModalOpen(true);
                    }}
                  >
                    <Text style={styles.resolveBtnText}>Resolve Ticket →</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.resolvedBox}>
                    <Text style={styles.resolvedText}>✓ Resolved: {g.resolution}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Resolution Modal */}
      <Modal visible={resolveModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resolve Grievance Ticket</Text>
            <Text style={styles.modalSubtitle}>{selectedTicket?.category} • {selectedTicket?.farmer?.name}</Text>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Enter official resolution details..."
              value={resolutionInput}
              onChangeText={setResolutionInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolveModalOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleResolveGrievance} disabled={submitting}>
                <Text style={styles.saveText}>Save Resolution →</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    marginBottom: 20
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4
  },
  statValueGreen: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F5132',
    marginTop: 4
  },
  statValueAmber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D97706',
    marginTop: 4
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16
  },
  slaBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  table: {
    gap: 12
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  centreName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  centreSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  colVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827'
  },
  colValGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132'
  },
  colSub: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  barWrap: {
    width: 70,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0F5132'
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  grievanceGrid: {
    gap: 12
  },
  grievanceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  gHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  slaTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  slaOk: {
    backgroundColor: '#FEF3C7'
  },
  slaBreached: {
    backgroundColor: '#FEE2E2'
  },
  slaText: {
    fontSize: 11,
    fontWeight: '800'
  },
  slaTextOk: {
    color: '#D97706'
  },
  slaTextBreached: {
    color: '#DC2626'
  },
  gDesc: {
    fontSize: 13,
    color: '#374151',
    marginTop: 6
  },
  gFarmer: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  resolveBtn: {
    marginTop: 10,
    backgroundColor: '#0F5132',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  resolvedBox: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6
  },
  resolvedText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: '700'
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
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  cancelText: {
    color: '#4B5563',
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
});

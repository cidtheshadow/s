import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../src/lib/api';

interface PriceItem {
  crop: string;
  latest: {
    modal_price: number;
    min_price: number;
    max_price: number;
    msp: number;
    mandi: string;
    state: string;
    date: string;
  };
  sparkline: { date: string; price: number }[];
  recommendation: {
    hint: 'SELL_NOW' | 'HOLD';
    hintReason: string;
    mspDifference: number;
  };
}

export default function PricesScreen() {
  const { t } = useTranslation();

  const [pricesData, setPricesData] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const data = await apiFetch<PriceItem[]>('/prices');
      setPricesData(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load live price data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Mandi Prices & MSP | मंडी भाव</Text>
        <Text style={styles.subtitle}>Daily price comparison and 7-day market trend analysis</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {pricesData.map((item) => {
            const isSellNow = item.recommendation.hint === 'SELL_NOW';
            const maxP = Math.max(...item.sparkline.map(s => s.price), item.latest.modal_price);
            const minP = Math.min(...item.sparkline.map(s => s.price), item.latest.modal_price);
            const priceRange = maxP - minP || 1;

            return (
              <View key={item.crop} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cropTitle}>{item.crop}</Text>
                    <Text style={styles.mandiLocation}>📍 {item.latest.mandi}, {item.latest.state}</Text>
                  </View>
                  <View style={[styles.hintBadge, isSellNow ? styles.sellBadge : styles.holdBadge]}>
                    <Text style={[styles.hintText, isSellNow ? styles.sellText : styles.holdText]}>
                      {isSellNow ? '🟢 SELL NOW' : '🟡 HOLD / MSP'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reasonText}>{item.recommendation.hintReason}</Text>

                {/* Main Price Numbers Row */}
                <View style={styles.priceRow}>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Modal Mandi Rate</Text>
                    <Text style={styles.modalPrice}>₹{item.latest.modal_price} <Text style={styles.perQtl}>/qtl</Text></Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Govt MSP</Text>
                    <Text style={styles.mspPrice}>₹{item.latest.msp} <Text style={styles.perQtl}>/qtl</Text></Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Min - Max Range</Text>
                    <Text style={styles.rangePrice}>₹{item.latest.min_price} - ₹{item.latest.max_price}</Text>
                  </View>
                </View>

                {/* 7-Day Sparkline Bar Chart Visual */}
                <View style={styles.sparklineSection}>
                  <Text style={styles.sparklineTitle}>7-Day Price Trend (Recent Days)</Text>
                  <View style={styles.sparklineBarsRow}>
                    {item.sparkline.map((pt, idx) => {
                      const barHeightPct = Math.max(20, ((pt.price - minP) / priceRange) * 100);
                      return (
                        <View key={idx} style={styles.barCol}>
                          <Text style={styles.barVal}>₹{pt.price}</Text>
                          <View style={styles.barContainer}>
                            <View style={[styles.barFill, { height: `${barHeightPct}%` }]} />
                          </View>
                          <Text style={styles.barDate}>{pt.date.slice(-5)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
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
    gap: 18
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  cropTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },
  mandiLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  hintBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  sellBadge: {
    backgroundColor: '#E8F5E9'
  },
  holdBadge: {
    backgroundColor: '#FEF3C7'
  },
  hintText: {
    fontSize: 12,
    fontWeight: '800'
  },
  sellText: {
    color: '#0F5132'
  },
  holdText: {
    color: '#D97706'
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0F5132'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  priceBox: {
    alignItems: 'flex-start'
  },
  priceLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F5132',
    marginTop: 2
  },
  mspPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 2
  },
  rangePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4
  },
  perQtl: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280'
  },
  sparklineSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  sparklineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 10
  },
  sparklineBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70
  },
  barCol: {
    alignItems: 'center',
    flex: 1
  },
  barVal: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4
  },
  barContainer: {
    width: 14,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    backgroundColor: '#0F5132',
    borderRadius: 4
  },
  barDate: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4
  }
});

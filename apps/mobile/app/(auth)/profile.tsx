import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CROPS_LIST, SUPPORTED_LANGUAGES } from '@kisanify/shared';
import { apiFetch } from '../../src/lib/api';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Punjab');
  const [language, setLanguage] = useState('hi');
  const [landSize, setLandSize] = useState('5.5');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Wheat (गेहूं)']);
  const [aadhaar, setAadhaar] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== crop));
      }
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!name || !village || !district) {
      setError('Please fill in all required fields (Name, Village, District)');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/farmers/profile', {
        method: 'POST',
        body: JSON.stringify({
          name,
          village,
          district,
          state,
          preferred_language: language,
          land_size_acres: parseFloat(landSize) || 1.0,
          crop_types: selectedCrops,
          aadhaar_ref_masked: aadhaar ? aadhaar : undefined
        })
      });

      router.replace('/(farmer)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Farmer Registration | किसान पंजीकरण</Text>
        <Text style={styles.subtitle}>Complete your profile to book mandi slots</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Full Name / पूरा नाम *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Gurpreet Singh"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Village / गाँव *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Khanna Kalan"
              value={village}
              onChangeText={setVillage}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>District / ज़िला *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ludhiana"
              value={district}
              onChangeText={setDistrict}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>State / राज्य *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Punjab"
              value={state}
              onChangeText={setState}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Land (Acres) / जमीन (एकड़)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="5.0"
              value={landSize}
              onChangeText={setLandSize}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Select Crops Grown / फसलें चुनें</Text>
          <View style={styles.cropsGrid}>
            {CROPS_LIST.map((crop) => {
              const isSelected = selectedCrops.includes(crop);
              return (
                <TouchableOpacity
                  key={crop}
                  onPress={() => toggleCrop(crop)}
                  style={[styles.cropChip, isSelected && styles.cropChipSelected]}
                >
                  <Text style={[styles.cropText, isSelected && styles.cropTextSelected]}>
                    {isSelected ? '✓ ' : '+ '}{crop}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Masked Aadhaar Ref (Optional, Last 4 digits only)</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXX-XXXX-1234"
            keyboardType="number-pad"
            maxLength={14}
            value={aadhaar}
            onChangeText={setAadhaar}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Profile & Continue →</Text>
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
    marginBottom: 16
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6
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
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  cropChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6'
  },
  cropChipSelected: {
    borderColor: '#0F5132',
    backgroundColor: '#E8F5E9'
  },
  cropText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600'
  },
  cropTextSelected: {
    color: '#0F5132',
    fontWeight: '700'
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#0F5132',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  }
});

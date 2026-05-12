import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius } from '../theme';
import * as api from '../api';

const CATEGORIES = [
  { icon: '🔧', label: 'Plumbing',    value: 'Plumbing repair' },
  { icon: '⚡', label: 'Electrical',  value: 'Electrical work' },
  { icon: '🧹', label: 'Cleaning',    value: 'House cleaning' },
  { icon: '🌿', label: 'Landscaping', value: 'Landscaping and yard work' },
  { icon: '🎨', label: 'Painting',    value: 'Painting' },
  { icon: '❄️', label: 'HVAC',        value: 'HVAC service' },
  { icon: '🪚', label: 'Carpentry',   value: 'Carpentry and woodwork' },
  { icon: '🏠', label: 'Handyman',    value: 'General handyman' },
  { icon: '🔩', label: 'Appliances',  value: 'Appliance repair' },
  { icon: '🐜', label: 'Pest Control',value: 'Pest control' },
  { icon: '🪟', label: 'Windows',     value: 'Window cleaning or repair' },
  { icon: '🚿', label: 'Bathrooms',   value: 'Bathroom renovation or repair' },
];

const URGENCIES = [
  { label: '📅 Flexible',  value: 'flexible' },
  { label: '📆 This week', value: 'this week' },
  { label: '🚨 Urgent',    value: 'urgent' },
];

const PAYMENTS = [
  { label: 'Credit card', value: 'credit_card' },
  { label: 'Cash',        value: 'cash' },
  { label: 'PayPal',      value: 'paypal' },
];

export default function PostJobScreen({ navigation }) {
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [address,     setAddress]     = useState('');
  const [price,       setPrice]       = useState('');
  const [payment,     setPayment]     = useState('credit_card');
  const [urgency,     setUrgency]     = useState('flexible');
  const [photos,      setPhotos]      = useState([]);
  const [loading,     setLoading]     = useState(false);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo access to attach images.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 4));
  }

  async function submit() {
    if (!category)    { Alert.alert('Missing field', 'Please select a service category.'); return; }
    if (!description) { Alert.alert('Missing field', 'Please describe the job.'); return; }
    if (!address)     { Alert.alert('Missing field', 'Please enter the service address.'); return; }
    if (!price || Number(price) <= 0) { Alert.alert('Missing field', 'Please enter a valid budget.'); return; }

    setLoading(true);
    const fullDesc = `${description} Urgency: ${urgency}.`;
    const { ok, data } = await api.submitBid({
      category,
      description: fullDesc,
      address,
      price: Number(price),
      payment_method: payment,
    });
    setLoading(false);

    if (ok) {
      Alert.alert('Request posted!', 'We\'re matching you with a local provider.', [
        { text: 'View dashboard', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } else {
      Alert.alert('Error', data.error || 'Could not post job. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Post a job</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Category grid */}
        <Text style={styles.label}>What do you need?</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[styles.catTile, category === c.value && styles.catTileActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={styles.catEmoji}>{c.icon}</Text>
              <Text style={[styles.catLabel, category === c.value && styles.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Describe the job</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="e.g. Kitchen faucet is dripping constantly, needs new washer or full replacement…"
          placeholderTextColor={colors.muted}
        />

        {/* Photos */}
        <Text style={styles.label}>Photos (optional)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          <Text style={styles.photoBtnText}>
            {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} added — tap to add more` : '📷 Add photos'}
          </Text>
        </TouchableOpacity>

        {/* Address */}
        <Text style={styles.label}>Service address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="123 Maple Street, Denver, CO 80202"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
        />

        {/* Budget */}
        <Text style={styles.label}>Your budget (USD)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="150"
          placeholderTextColor={colors.muted}
        />

        {/* Urgency */}
        <Text style={styles.label}>Urgency</Text>
        <View style={styles.chipRow}>
          {URGENCIES.map(u => (
            <TouchableOpacity
              key={u.value}
              style={[styles.chip, urgency === u.value && styles.chipActive]}
              onPress={() => setUrgency(u.value)}
            >
              <Text style={[styles.chipText, urgency === u.value && styles.chipTextActive]}>{u.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <Text style={styles.label}>Payment method</Text>
        <View style={styles.chipRow}>
          {PAYMENTS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[styles.chip, payment === p.value && styles.chipActive]}
              onPress={() => setPayment(p.value)}
            >
              <Text style={[styles.chipText, payment === p.value && styles.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && styles.disabled]} onPress={submit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Post job →</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back:  { color: colors.honey, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700' },

  content: { padding: 20, paddingBottom: 60 },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catTile: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    width: '22%',
    backgroundColor: colors.card,
  },
  catTileActive: { borderColor: colors.honey, backgroundColor: '#fff8ee' },
  catEmoji:      { fontSize: 22, marginBottom: 4 },
  catLabel:      { fontSize: 10, fontWeight: '600', color: colors.muted, textAlign: 'center' },
  catLabelActive:{ color: colors.honeyDark },

  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },

  photoBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  photoBtnText: { color: colors.muted, fontSize: 14 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.card,
  },
  chipActive:     { borderColor: colors.honey, backgroundColor: '#fff8ee' },
  chipText:       { fontSize: 13, color: colors.muted, fontWeight: '600' },
  chipTextActive: { color: colors.honeyDark },

  submitBtn: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  disabled:    { opacity: 0.6 },
  submitText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});

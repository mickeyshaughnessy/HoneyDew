import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Alert,
} from 'react-native';
import { colors, radius, shadow } from '../theme';
import StarRating from '../components/StarRating';
import * as api from '../api';

export default function JobDetailScreen({ route, navigation }) {
  const [job, setJob]       = useState(route.params.job);
  const [rating, setRating] = useState(0);
  const [modal, setModal]   = useState(false);

  const isComplete  = !!job.completed_at;
  const canRate     = job.provider_username && !isComplete && !job.buyer_signed;
  const isBid       = !job.provider_username;

  async function cancel() {
    Alert.alert('Cancel request', 'Remove this request from the exchange?', [
      { text: 'No',  style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        const { ok } = await api.cancelBid(job.bid_id);
        if (ok) navigation.goBack(); else Alert.alert('Error', 'Could not cancel.');
      }},
    ]);
  }

  async function submitRating() {
    if (!rating) { Alert.alert('Pick a rating', 'Select 1–5 stars.'); return; }
    const { ok, data } = await api.signJob(job.job_id, rating);
    if (ok) {
      setModal(false);
      setJob(j => ({ ...j, completed_at: Date.now() / 1000, buyer_signed: true }));
    } else {
      Alert.alert('Error', data.error || 'Could not submit rating.');
    }
  }

  function Row({ label, value }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '—'}</Text>
      </View>
    );
  }

  const statusColor = isComplete ? '#155724' : job.provider_username ? '#0c5460' : '#856404';
  const statusBg    = isComplete ? '#d4edda' : job.provider_username ? '#d1ecf1' : '#fff3cd';
  const statusLabel = isComplete ? 'Completed' : job.provider_username ? 'Provider matched' : 'Waiting for match';

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Job details</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status + price */}
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.price}>${Number(job.price).toFixed(2)}</Text>
        </View>

        {/* Service description */}
        <View style={styles.card}>
          <Text style={styles.service}>{job.service}</Text>
        </View>

        {/* Details */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Row label="📍 Address"        value={job.address} />
          <Row label="💳 Payment"         value={job.payment_method} />
          {job.completed_at ? (
            <Row label="✅ Completed"     value={new Date(job.completed_at * 1000).toLocaleDateString()} />
          ) : null}
        </View>

        {/* Provider */}
        {job.provider_username ? (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionLabel}>Your provider</Text>
            <Text style={styles.providerName}>👷 {job.provider_username}</Text>
            <Text style={styles.providerRep}>Reputation: {job.provider_reputation ?? '—'}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          {isBid && (
            <TouchableOpacity style={styles.btnDanger} onPress={cancel}>
              <Text style={styles.btnDangerText}>Cancel request</Text>
            </TouchableOpacity>
          )}
          {canRate && (
            <TouchableOpacity style={styles.btnPrimary} onPress={() => { setRating(0); setModal(true); }}>
              <Text style={styles.btnPrimaryText}>Mark complete & rate</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* Rating modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rate your provider</Text>
            <Text style={styles.modalSub}>How did the job go?</Text>
            <View style={{ marginVertical: 24 }}>
              <StarRating onRate={setRating} />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={submitRating}>
              <Text style={styles.btnPrimaryText}>Submit rating</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 14 }} onPress={() => setModal(false)}>
              <Text style={{ color: colors.muted, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  price:     { fontSize: 24, fontWeight: '800', color: colors.honey },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  service: { fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 22 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, maxWidth: '60%', textAlign: 'right' },

  sectionLabel:  { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  providerName:  { fontSize: 17, fontWeight: '700', color: colors.text },
  providerRep:   { fontSize: 13, color: colors.muted, marginTop: 4 },

  actions: { marginTop: 24, gap: 12 },

  btnPrimary: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    padding: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDanger: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    padding: 14,
    alignItems: 'center',
  },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  modalSub:   { color: colors.muted },
});

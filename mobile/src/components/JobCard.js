import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../theme';

const BADGE = {
  pending:  { bg: '#fff3cd', text: '#856404', label: 'Waiting for match' },
  matched:  { bg: '#d1ecf1', text: '#0c5460', label: 'Provider matched' },
  complete: { bg: '#d4edda', text: '#155724', label: 'Completed' },
};

function badge(job) {
  if (job.completed_at) return BADGE.complete;
  if (job.provider_username) return BADGE.matched;
  return BADGE.pending;
}

export default function JobCard({ job, onPress, onCancel, onRate }) {
  const b = badge(job);
  const price = `$${Number(job.price).toFixed(2)}`;
  const isBid = !!job.bid_id && !job.provider_username;
  const canRate = job.provider_username && !job.completed_at && !job.buyer_signed;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: b.bg }]}>
          <Text style={[styles.badgeText, { color: b.text }]}>{b.label}</Text>
        </View>
        <Text style={styles.price}>{price}</Text>
      </View>

      <Text style={styles.service} numberOfLines={2}>{job.service}</Text>

      {job.address ? (
        <Text style={styles.meta}>📍 {job.address}</Text>
      ) : null}

      {job.provider_username ? (
        <Text style={styles.meta}>👷 {job.provider_username}</Text>
      ) : null}

      <View style={styles.actions}>
        {isBid && onCancel ? (
          <TouchableOpacity style={styles.btnDanger} onPress={() => onCancel(job.bid_id)}>
            <Text style={styles.btnDangerText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
        {canRate && onRate ? (
          <TouchableOpacity style={styles.btnPrimary} onPress={() => onRate(job.job_id)}>
            <Text style={styles.btnPrimaryText}>Complete & rate</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '800', color: colors.honey },
  service: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
  meta: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnPrimary: {
    backgroundColor: colors.honey,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnDanger: {
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

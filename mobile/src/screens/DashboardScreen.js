import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, shadow } from '../theme';
import JobCard from '../components/JobCard';
import StarRating from '../components/StarRating';
import * as api from '../api';

export default function DashboardScreen({ navigation }) {
  const [bids, setBids]           = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingJobId, setRatingJobId] = useState(null);
  const [rating, setRating]       = useState(0);
  const [username, setUsername]   = useState('');

  async function load() {
    const [meRes, bidsRes, jobsRes] = await Promise.all([
      api.me(),
      api.getBids(),
      api.getJobs(),
    ]);
    if (meRes.ok) setUsername(meRes.data.username || '');
    setBids(bidsRes.ok  ? (bidsRes.data.bids  || []) : []);
    setJobs(jobsRes.ok  ? (jobsRes.data.jobs  || []) : []);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function cancelBid(bidId) {
    Alert.alert('Cancel request', 'Are you sure?', [
      { text: 'No',  style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        const { ok } = await api.cancelBid(bidId);
        if (ok) load(); else Alert.alert('Error', 'Could not cancel. Please try again.');
      }},
    ]);
  }

  async function submitRating() {
    if (!rating) { Alert.alert('Pick a rating', 'Please select 1–5 stars.'); return; }
    const { ok, data } = await api.signJob(ratingJobId, rating);
    if (ok) {
      setRatingJobId(null);
      setRating(0);
      load();
    } else {
      Alert.alert('Error', data.error || 'Could not submit rating.');
    }
  }

  const allItems = [
    { type: 'header', key: 'h1', title: 'Open requests', count: bids.length, action: () => navigation.navigate('PostJob') },
    ...bids.map(b => ({ type: 'bid', key: b.bid_id, data: b })),
    bids.length === 0 ? { type: 'empty', key: 'e1', msg: 'No open requests yet.' } : null,
    { type: 'header', key: 'h2', title: 'Jobs', count: jobs.length, action: null },
    ...jobs.map(j => ({ type: 'job', key: j.job_id, data: j })),
    jobs.length === 0 ? { type: 'empty', key: 'e2', msg: 'No active or completed jobs.' } : null,
  ].filter(Boolean);

  return (
    <View style={styles.flex}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hi{username ? `, ${username}` : ''} 👋</Text>
          <Text style={styles.subGreeting}>Here's what's on your list</Text>
        </View>
        <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('PostJob')}>
          <Text style={styles.postBtnText}>+ Post a job</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allItems}
        keyExtractor={i => i.key}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.honey} />}
        renderItem={({ item }) => {
          if (item.type === 'header') return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}
                {item.count > 0 ? <Text style={styles.sectionCount}> ({item.count})</Text> : null}
              </Text>
              {item.action ? (
                <TouchableOpacity onPress={item.action}>
                  <Text style={styles.sectionLink}>+ New</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
          if (item.type === 'empty') return (
            <Text style={styles.emptyText}>{item.msg}</Text>
          );
          const job = item.data;
          return (
            <JobCard
              job={job}
              onPress={() => navigation.navigate('JobDetail', { job })}
              onCancel={item.type === 'bid' ? cancelBid : undefined}
              onRate={item.type === 'job' ? (id) => { setRatingJobId(id); setRating(0); } : undefined}
            />
          );
        }}
      />

      {/* Rating modal */}
      <Modal visible={!!ratingJobId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rate this job</Text>
            <Text style={styles.modalSub}>How did the provider do?</Text>
            <View style={styles.starsWrap}>
              <StarRating onRate={setRating} />
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={submitRating}>
              <Text style={styles.modalBtnText}>Submit rating</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRatingJobId(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting:    { fontSize: 20, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 13, color: colors.muted, marginTop: 2 },
  postBtn: {
    backgroundColor: colors.honey,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  list: { padding: 16, paddingBottom: 40 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionCount: { color: colors.muted, fontWeight: '400' },
  sectionLink:  { color: colors.honey, fontWeight: '700', fontSize: 14 },
  emptyText:    { color: colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  modalTitle:  { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  modalSub:    { color: colors.muted, marginBottom: 24 },
  starsWrap:   { marginBottom: 28 },
  modalBtn: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    paddingHorizontal: 40,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalCancel:  { color: colors.muted, fontSize: 15 },
});

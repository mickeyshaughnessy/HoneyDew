import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { colors, radius } from '../theme';
import * as api from '../api';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function submit() {
    if (!username.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter a username and password.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const fn = mode === 'login' ? api.login : api.register;
    const { ok, data } = await fn(username.trim(), password);
    setLoading(false);
    if (ok) {
      onAuth();
    } else {
      Alert.alert('Error', data.error || 'Something went wrong. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>🍯</Text>
          <Text style={styles.brand}>HoneyDew</Text>
          <Text style={styles.tagline}>Home services, simplified.</Text>
        </View>

        {/* Tab toggle */}
        <View style={styles.tabs}>
          {['login', 'register'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your_username"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            onSubmitEditing={submit}
            returnKeyType="go"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Get started'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category preview */}
        <View style={styles.categoryRow}>
          {['🔧','⚡','🧹','🌿','🎨','❄️','🏠','🔩'].map(icon => (
            <View key={icon} style={styles.catIcon}>
              <Text style={styles.catEmoji}>{icon}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.catCaption}>Plumbing · Electrical · Cleaning · Landscaping · and more</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, paddingTop: 60, alignItems: 'center' },

  logoWrap:  { alignItems: 'center', marginBottom: 32 },
  logo:      { fontSize: 56 },
  brand:     { fontSize: 32, fontWeight: '800', color: colors.honey, letterSpacing: -1 },
  tagline:   { fontSize: 15, color: colors.muted, marginTop: 4 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#efe8da',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 20,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive:     { backgroundColor: colors.card },
  tabText:       { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.text },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  btn: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  categoryRow: { flexDirection: 'row', gap: 8, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' },
  catIcon:     { backgroundColor: colors.card, borderRadius: radius.sm, padding: 10, borderWidth: 1, borderColor: colors.border },
  catEmoji:    { fontSize: 20 },
  catCaption:  { color: colors.muted, fontSize: 12, marginTop: 10, textAlign: 'center' },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function StarRating({ onRate }) {
  const [selected, setSelected] = useState(0);

  function pick(v) {
    setSelected(v);
    onRate(v);
  }

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(v => (
        <TouchableOpacity key={v} onPress={() => pick(v)} hitSlop={8}>
          <Text style={[styles.star, v <= selected && styles.filled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', gap: 6 },
  star:   { fontSize: 36, color: '#ddd' },
  filled: { color: colors.honey },
});

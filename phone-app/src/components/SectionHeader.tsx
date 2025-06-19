import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type SectionHeaderProps = {
  title: string;
};

const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    color: '#AAB8C2',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SectionHeader; 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  changeColor: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, changeColor, icon, iconColor }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={[styles.change, { color: changeColor }]}>{change}</Text>
      </View>
      <Feather name={icon} size={28} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#AAB8C2',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MetricCard; 
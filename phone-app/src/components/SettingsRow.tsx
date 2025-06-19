import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  type: 'toggle' | 'navigate';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
};

const SettingsRow = ({ icon, title, type, value, onValueChange, onPress }: SettingsRowProps) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={type !== 'navigate'}>
      <View style={styles.container}>
        <Ionicons name={icon} size={24} color="#AAB8C2" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        {type === 'toggle' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
          />
        )}
        {type === 'navigate' && (
          <Ionicons name="chevron-forward" size={24} color="#AAB8C2" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 20,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SettingsRow; 
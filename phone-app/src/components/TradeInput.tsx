import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TradeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  keyboardType?: 'numeric' | 'default';
}

const TradeInput: React.FC<TradeInputProps> = ({ label, value, onChange, onIncrement, onDecrement, keyboardType = 'numeric' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={onDecrement} style={styles.button}>
          <Feather name="minus" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          textAlign="center"
        />
        <TouchableOpacity onPress={onIncrement} style={styles.button}>
          <Feather name="plus" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#AAB8C2',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    height: 52,
  },
  button: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    height: '100%',
  },
});

export default TradeInput; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type OrderType = 'Market' | 'Limit' | 'Stop';

interface OrderTypeSelectorProps {
  options: OrderType[];
  selected: OrderType;
  onSelect: (option: OrderType) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ options, selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Order Type</Text>
      <View style={styles.selectorContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected === option && styles.selectedOption]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, selected === option && styles.selectedOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
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
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#374151',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#AAB8C2',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
});

export default OrderTypeSelector; 
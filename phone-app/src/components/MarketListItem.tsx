import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MarketListItemProps {
  name: string;
  symbol: string;
  price?: string;
  changePercent: string;
  isPositive: boolean;
  onPress: () => void;
}

const MarketListItem: React.FC<MarketListItemProps> = ({ name, symbol, price, changePercent, isPositive, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.right}>
        {price && <Text style={styles.price}>{price}</Text>}
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' }]}>
          <Feather name={isPositive ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={isPositive ? '#065F46' : '#991B1B'} />
          <Text style={[styles.change, { color: isPositive ? '#065F46' : '#991B1B' }]}>
            {changePercent}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  left: {
    flex: 1,
    marginRight: 16,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 14,
    color: '#AAB8C2',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MarketListItem; 
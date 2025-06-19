import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TransactionHistoryItemProps {
  symbol: string;
  type: 'buy' | 'sell';
  assetType: 'stock' | 'option';
  quantity: number;
  price: number;
  date: string;
  optionType?: 'call' | 'put';
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = (props) => {
  const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
  const isBuy = props.type === 'buy';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: isBuy ? '#D1FAE5' : '#FEE2E2' }]}>
          <Feather name={isBuy ? 'trending-up' : 'trending-down'} size={20} color={isBuy ? '#065F46' : '#991B1B'} />
        </View>
        <View>
          <Text style={styles.symbol}>{props.symbol} <Text style={styles.type}>{props.type}</Text></Text>
          <Text style={styles.date}>{props.date}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(props.price * props.quantity)}</Text>
        <Text style={styles.quantity}>{props.quantity} shares at {formatCurrency(props.price)}</Text>
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  type: {
      textTransform: 'capitalize',
      fontWeight: 'normal',
      color: '#AAB8C2'
  },
  date: {
    fontSize: 14,
    color: '#AAB8C2',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quantity: {
    fontSize: 14,
    color: '#AAB8C2',
    marginTop: 2,
  },
});

export default TransactionHistoryItem; 
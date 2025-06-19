import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PositionCardProps {
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  changePercent: number;
  isPositive: boolean;
  // Option specific
  isOption?: boolean;
  strikePrice?: number;
  expiryDate?: string;
  optionType?: 'call' | 'put';
}

const PositionCard: React.FC<PositionCardProps> = ({
    symbol,
    name,
    quantity,
    currentPrice,
    totalValue,
    changePercent,
    isPositive,
    isOption,
    strikePrice,
    expiryDate,
    optionType
}) => {
  const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
  const formatPercent = (percent: number): string => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' }]}>
            <Feather name={isPositive ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={isPositive ? '#065F46' : '#991B1B'} />
            <Text style={[styles.changeText, { color: isPositive ? '#065F46' : '#991B1B' }]}>
              {formatPercent(changePercent)}
            </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Value</Text>
          <Text style={styles.detailValue}>{formatCurrency(totalValue)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Qty</Text>
          <Text style={styles.detailValue}>{quantity}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>{formatCurrency(currentPrice)}</Text>
        </View>
      </View>

      {isOption && (
        <View style={styles.optionDetails}>
            <Text style={[styles.optionType, {
                color: optionType === 'call' ? '#065F46' : '#991B1B',
                backgroundColor: optionType === 'call' ? '#D1FAE5' : '#FEE2E2'
            }]}>
                {optionType?.toUpperCase()}
            </Text>
            <Text style={styles.optionText}>Strike: {formatCurrency(strikePrice || 0)}</Text>
            <Text style={styles.optionText}>Expiry: {expiryDate}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 14,
    color: '#AAB8C2',
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#AAB8C2',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  optionType: {
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 12,
  },
  optionText: {
    fontSize: 12,
    color: '#AAB8C2',
    marginRight: 12,
  }
});

export default PositionCard; 
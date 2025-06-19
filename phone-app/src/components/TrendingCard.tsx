import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TrendingCardProps {
  symbol: string;
  name: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
  isHot: boolean;
  onPress: () => void;
}

const TrendingCard: React.FC<TrendingCardProps> = ({ symbol, name, price, changePercent, isPositive, isHot, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        {isHot && (
          <View style={styles.hotBadge}>
            <Feather name="zap" size={12} color="#FBBF24" />
            <Text style={styles.hotText}>Hot</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={[styles.change, { color: isPositive ? '#10B981' : '#EF4444' }]}>
          {changePercent}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    width: 160,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hotText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  name: {
    fontSize: 12,
    color: '#AAB8C2',
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TrendingCard; 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangeAmount: number;
  availableCash: number;
  positions: number;
}

const PortfolioOverview: React.FC = () => {
  const portfolioData: PortfolioData = {
    totalValue: 125420.50,
    dailyChange: 2.4,
    dailyChangeAmount: 3012.85,
    availableCash: 15420.30,
    positions: 12,
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Overview</Text>
        <View style={styles.liveBadge}>
          <Feather name="activity" size={12} color="#34D399" />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.totalValue}>
          {formatCurrency(portfolioData.totalValue)}
        </Text>
        
        <View style={styles.changeContainer}>
          <Feather name="trending-up" size={16} color="#10B981" />
          <Text style={styles.changeText}>
            +{portfolioData.dailyChange}% (+{formatCurrency(portfolioData.dailyChangeAmount)}) today
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Available Cash</Text>
            <Text style={styles.statValue}>
              {formatCurrency(portfolioData.availableCash)|| 'Loading...'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Positions</Text>
            <Text style={styles.statValue}>{portfolioData.positions}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    alignItems: 'flex-start',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeText: {
    fontSize: 16,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#AAB8C2',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PortfolioOverview;

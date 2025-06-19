import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MarketStats {
  spyChange: number;
  vixLevel: number;
  cryptoSentiment: string;
  activeTraders: number;
}

const MarketPulse: React.FC = () => {
  const [marketStats, setMarketStats] = useState<MarketStats>({
    spyChange: 0.85,
    vixLevel: 18.4,
    cryptoSentiment: 'bullish',
    activeTraders: 15420,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStats(prev => ({
        ...prev,
        spyChange: prev.spyChange + (Math.random() - 0.5) * 0.1,
        vixLevel: Math.max(10, Math.min(30, prev.vixLevel + (Math.random() - 0.5) * 0.5)),
        activeTraders: prev.activeTraders + Math.floor((Math.random() - 0.5) * 100),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="activity" size={20} color="#3B82F6" />
        <Text style={styles.title}>Market Pulse</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>S&P 500</Text>
          <View style={styles.statValue}>
            <Feather name="trending-up" size={12} color="#10B981" />
            <Text style={styles.positiveChange}>
              +{marketStats.spyChange.toFixed(2)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>VIX</Text>
          <Text style={styles.statNumber}>{marketStats.vixLevel.toFixed(1)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active Traders</Text>
          <View style={styles.statValue}>
            <Feather name="users" size={12} color="#3B82F6" />
            <Text style={styles.statNumber}>
              {marketStats.activeTraders.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Full Market</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#AAB8C2',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  positiveChange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarketPulse;

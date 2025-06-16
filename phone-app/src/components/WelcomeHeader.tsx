
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WelcomeHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Welcome back, Trader!</Text>
        <Text style={styles.subtitle}>
          Here's what's happening in your portfolio today
        </Text>
      </View>
      <View style={styles.badge}>
        <Feather name="smartphone" size={16} color="#6B7280" />
        <Text style={styles.badgeText}>Mobile Optimized</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  headerContent: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default WelcomeHeader;

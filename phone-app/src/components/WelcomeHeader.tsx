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
        <Feather name="smartphone" size={16} color="#E1E8ED" />
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB8C2',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#E1E8ED',
    fontWeight: '500',
  },
});

export default WelcomeHeader;

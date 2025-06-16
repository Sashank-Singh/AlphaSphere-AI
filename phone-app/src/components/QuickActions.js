
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const QuickActions = ({ navigation }) => {
  const actions = [
    { label: 'Quick Trade', icon: 'zap', screen: 'Trading', color: '#3B82F6' },
    { label: 'AI Insights', icon: 'brain', color: '#10B981' },
    { label: 'Portfolio', icon: 'target', screen: 'Portfolio', color: '#F59E0B' },
    { label: 'Analytics', icon: 'bar-chart-2', color: '#06B6D4' },
  ];

  const handleActionPress = (action) => {
    if (action.screen) {
      navigation.navigate(action.screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="zap" size={20} color="#3B82F6" />
        <Text style={styles.title}>Quick Actions</Text>
      </View>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Feather name={action.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

export default QuickActions;

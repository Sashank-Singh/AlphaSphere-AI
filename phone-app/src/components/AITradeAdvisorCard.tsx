import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AITradeAdvisorCardProps {
  action: 'Buy' | 'Sell' | 'Hold';
  confidence: 'High' | 'Medium' | 'Low';
  targetPrice: string;
  reasoning: string;
  onPress: () => void;
}

const AITradeAdvisorCard: React.FC<AITradeAdvisorCardProps> = (props) => {
  const getActionStyle = () => {
    switch (props.action) {
      case 'Buy': return { container: styles.buyContainer, text: styles.buyText, icon: 'trending-up' as const, iconColor: '#065F46' };
      case 'Sell': return { container: styles.sellContainer, text: styles.sellText, icon: 'trending-down' as const, iconColor: '#991B1B' };
      default: return { container: styles.holdContainer, text: styles.holdText, icon: 'pause-circle' as const, iconColor: '#57534E' };
    }
  };

  const { container, text, icon, iconColor } = getActionStyle();

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
        <View style={styles.header}>
            <Feather name="cpu" size={16} color="#3B82F6" />
            <Text style={styles.title}>AI Trade Advisor</Text>
        </View>
        <View style={styles.content}>
            <View style={[styles.actionBadge, container]}>
                <Feather name={icon} size={14} color={iconColor} />
                <Text style={[styles.actionText, text]}>{props.action.toUpperCase()}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.reasoning}>{props.reasoning}</Text>
                <Text style={styles.targetPrice}>Target: {props.targetPrice} (Confidence: {props.confidence})</Text>
            </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    buyContainer: { backgroundColor: '#D1FAE5' },
    buyText: { color: '#065F46' },
    sellContainer: { backgroundColor: '#FEE2E2' },
    sellText: { color: '#991B1B' },
    holdContainer: { backgroundColor: '#F5F5F4' },
    holdText: { color: '#57534E' },
    details: {
        flex: 1,
    },
    reasoning: {
        fontSize: 14,
        color: '#E1E8ED',
        marginBottom: 4,
    },
    targetPrice: {
        fontSize: 12,
        color: '#AAB8C2',
    },
});

export default AITradeAdvisorCard; 
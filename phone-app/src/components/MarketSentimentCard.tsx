import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MarketSentimentCard: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Market Sentiment</Text>
            <View style={styles.sentimentBar}>
                <View style={[styles.sentimentSection, { backgroundColor: '#10B981', width: '65%' }]} />
                <View style={[styles.sentimentSection, { backgroundColor: '#F59E0B', width: '20%' }]} />
                <View style={[styles.sentimentSection, { backgroundColor: '#EF4444', width: '15%' }]} />
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Bullish 65%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Neutral 20%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Bearish 15%</Text>
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
        marginTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    sentimentBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    sentimentSection: {
        height: '100%',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#AAB8C2',
    },
});

export default MarketSentimentCard; 
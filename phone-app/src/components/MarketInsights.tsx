import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import MarketSentimentCard from './MarketSentimentCard';
import SectorPerformanceCard from './SectorPerformanceCard';
import NewsCard from './NewsCard';

const MarketInsights: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Feather name="bar-chart-2" size={20} color="#FFFFFF" />
                <Text style={styles.title}>Market Insights & Analysis</Text>
            </View>
            <MarketSentimentCard />
            <SectorPerformanceCard />
            <NewsCard />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 8,
    },
});

export default MarketInsights; 
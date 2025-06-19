import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import PositionCard from './PositionCard';
import AIPortfolioOptimizer from './AIPortfolioOptimizer';

const mockPositions = [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, averagePrice: 150, currentPrice: 189.25, isOption: false },
    { id: '2', symbol: 'TSLA', name: 'Tesla, Inc.', quantity: 5, averagePrice: 200, currentPrice: 198.87, isOption: false },
    { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 7, averagePrice: 800, currentPrice: 875.43, isOption: false },
];

const MainContentTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState('positions');

    const renderContent = () => {
        switch (activeTab) {
            case 'positions':
                return (
                    <View>
                        {mockPositions.map(item => {
                            const totalValue = item.currentPrice * item.quantity;
                            const costBasis = item.averagePrice * item.quantity;
                            const changePercent = (totalValue - costBasis) / costBasis * 100;
                            const isPositive = totalValue >= costBasis;
                            return (
                                <PositionCard
                                    key={item.id}
                                    symbol={item.symbol}
                                    name={item.name}
                                    quantity={item.quantity}
                                    currentPrice={item.currentPrice}
                                    totalValue={totalValue}
                                    changePercent={changePercent}
                                    isPositive={isPositive}
                                    isOption={item.isOption}
                                />
                            );
                        })}
                    </View>
                );
            case 'ai-insights':
                return <AIPortfolioOptimizer />;
            case 'community':
                return <PlaceholderView title="Community" message="Community features coming soon." />;
            case 'alerts':
                return <PlaceholderView title="Alerts" message="Alerts and notifications will be shown here." />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TabButton title="Positions" active={activeTab === 'positions'} onPress={() => setActiveTab('positions')} />
                {/* <TabButton title="AI Insights" active={activeTab === 'ai-insights'} onPress={() => setActiveTab('ai-insights')} /> */}
                <TabButton title="Community" active={activeTab === 'community'} onPress={() => setActiveTab('community')} />
                {/* <TabButton title="Alerts" active={activeTab === 'alerts'} onPress={() => setActiveTab('alerts')} /> */}
            </View>
            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

const TabButton = ({ title, active, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
        <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
);

const PlaceholderView = ({ title, message }) => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderMessage}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { marginTop: 24 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4, marginBottom: 16 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 8 },
    activeTab: { backgroundColor: '#374151' },
    tabText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#AAB8C2' },
    activeTabText: { color: '#FFFFFF' },
    contentContainer: {},
    placeholderContainer: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 40, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
    placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
    placeholderMessage: { fontSize: 14, color: '#AAB8C2', textAlign: 'center' },
});

export default MainContentTabs; 
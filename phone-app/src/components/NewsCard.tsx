import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const mockNews = [
    { id: '1', headline: 'Fed signals potential rate cut in upcoming meeting', source: 'Bloomberg', time: '2h ago' },
    { id: '2', headline: 'Tech stocks rally on strong earnings reports', source: 'CNBC', time: '4h ago' },
    { id: '3', headline: 'Oil prices drop amid supply concerns', source: 'Reuters', time: '5h ago' },
];

const NewsCard: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>News & Events</Text>
            {mockNews.map(item => (
                <View key={item.id} style={styles.newsItem}>
                    <Text style={styles.headline}>{item.headline}</Text>
                    <Text style={styles.source}>{item.source} • {item.time}</Text>
                </View>
            ))}
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
    newsItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        paddingVertical: 12,
    },
    headline: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E1E8ED',
        marginBottom: 4,
    },
    source: {
        fontSize: 12,
        color: '#AAB8C2',
    },
});

export default NewsCard; 
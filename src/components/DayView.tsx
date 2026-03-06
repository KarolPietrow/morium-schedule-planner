import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSchedule } from '@/context/ScheduleContext';
import { ParsedClass } from '@/types';
import { useTheme } from "@react-navigation/core";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DayViewProps {
    dayName: string; // Dzień tygodnia
}

export default function DayView({ dayName }: DayViewProps) {
    const { savedClasses, isLoading } = useSchedule();
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Filtrujemy zajęcia tylko dla danego dnia i sortujemy po godzinie
    const dayClasses = savedClasses
        .filter(c => c.day === dayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const renderClassCard = ({ item }: { item: ParsedClass }) => (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text }}>{item.startTime} - {item.subject}</Text>
            <Text style={{ color: colors.text, opacity: 0.7 }}>{item.type} • {item.room}</Text>
        </View>
    );
    if (isLoading) return <Text>Ładowanie...</Text>;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{dayName}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    style={styles.manageButton}
                >
                    <Ionicons name="options-outline" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <Text style={[styles.statusText, { color: colors.text }]}>Ładowanie...</Text>
            ) : (
                <FlatList
                    data={dayClasses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderClassCard}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={[styles.statusText, { color: colors.text, opacity: 0.5 }]}>
                            Brak zajęć w tym dniu.
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    manageButton: {
        padding: 4,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 120, // Miejsce pod paskiem dolnym
    },
    card: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
    },
    statusText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    }
});
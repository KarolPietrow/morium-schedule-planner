import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Keyboard
} from 'react-native';

import { fetchLegacySchedule, fetchSchedulesList } from '@/api/universityApi';
import { parseLegacySchedule } from '@/utils/parser';
import { ParsedClass, ScheduleBasicInfo } from '@/types';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const [schedules, setSchedules] = useState<ScheduleBasicInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSchedulesList();
    }, []);

    const loadSchedulesList = async () => {
        try {
            setLoading(true);
            const list = await fetchSchedulesList();

            const validSchedules = list
                .filter(s => s.name && s.name.trim() !== '')
                .sort((a, b) => {
                    // Regex szuka cyfr na początku ciągu (^(\d+)), po których następuje spacja (\s+),
                    // a resztę tekstu pakuje do drugiej grupy ((.*))
                    const matchA = a.name.match(/^(\d+)\s+(.*)/);
                    const matchB = b.name.match(/^(\d+)\s+(.*)/);

                    // Jeśli dopasowano, bierzemy samą nazwę. Jeśli nie (np. "Wykład ogólnouniwersytecki"), bierzemy całość.
                    const textA = matchA ? matchA[2] : a.name;
                    const textB = matchB ? matchB[2] : b.name;

                    // Jeśli dopasowano, bierzemy numer. Jeśli nie, ustawiamy 0 (elementy bez numeru będą na początku).
                    const numA = matchA ? parseInt(matchA[1], 10) : 0;
                    const numB = matchB ? parseInt(matchB[1], 10) : 0;

                    // Najpierw sortujemy po tekście (nazwie kierunku)
                    const textCompare = textA.localeCompare(textB, 'pl');

                    if (textCompare !== 0) {
                        return textCompare; // Zwracamy wynik sortowania alfabetycznego
                    }

                    // Jeśli teksty są identyczne (np. dwa razy "Informatyka I st."), sortujemy po roku
                    return numA - numB;
                });
            setSchedules(validSchedules);
        } catch (err) {
            setError('Nie udało się pobrać listy kierunków.');
        } finally {
            setLoading(false);
        }
    };

    const loadScheduleData = async (id: number, name: string) => {
        try {
            Keyboard.dismiss();
            setSearchQuery(name);
            setIsSearching(false);
            setLoading(true);
            setError(null);
            setClasses([]);

            const rawData = await fetchLegacySchedule(id);
            const parsedData = parseLegacySchedule(rawData);
            setClasses(parsedData);
        } catch (err) {
            setError('Nie udało się pobrać planu zajęć.');
        } finally {
            setLoading(false);
        }
    };

    const filteredSchedules = schedules.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClassCard = ({ item }: { item: ParsedClass }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
                <Text style={styles.dayText}>{item.day}</Text>
            </View>

            <Text style={styles.subjectText}>{item.subject}</Text>

            <View style={styles.detailsRow}>
                <Text style={styles.typeText}>{item.type}</Text>
                {item.group && <Text style={styles.groupText}>Gr. {item.group}</Text>}
            </View>

            <View style={styles.bottomRow}>
                <Text style={styles.lecturerText} numberOfLines={1}>👤 {item.lecturer}</Text>
                <Text style={styles.roomText} numberOfLines={1}>📍 {item.room}</Text>
            </View>
        </View>
    );

    const renderScheduleItem = ({ item }: { item: ScheduleBasicInfo }) => (
        <TouchableOpacity
            style={styles.scheduleListItem}
            onPress={() => loadScheduleData(item.id, item.name)}
        >
            <Text style={styles.scheduleListText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>MoriumApp</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Wyszukaj kierunek..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                />
                {isSearching && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setIsSearching(false);
                            Keyboard.dismiss();
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Anuluj</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : isSearching ? (
                <FlatList
                    data={filteredSchedules}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderScheduleItem}
                    contentContainerStyle={styles.listContainer}
                    keyboardShouldPersistTaps="handled" // Pozwala na kliknięcie w element listy mimo otwartej klawiatury
                />
            ) : classes.length > 0 ? (
                <FlatList
                    data={classes}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={renderClassCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerBox}>
                    <Text style={styles.emptyText}>Wyszukaj i wybierz kierunek, aby zobaczyć plan.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        alignItems: 'center',
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#0F172A',
    },
    cancelButton: {
        padding: 8,
    },
    cancelButtonText: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        fontSize: 16,
    },
    emptyText: {
        color: '#64748B',
        textAlign: 'center',
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    scheduleListItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8, // fallback dla gap
    },
    scheduleListText: {
        color: '#1E293B',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    timeText: {
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    dayText: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
    },
    subjectText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    typeText: {
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: '500',
        overflow: 'hidden',
    },
    groupText: {
        backgroundColor: '#F1F5F9',
        color: '#475569',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: '500',
        overflow: 'hidden',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 8,
    },
    lecturerText: {
        flex: 1,
        color: '#64748B',
        fontSize: 13,
    },
    roomText: {
        flex: 1,
        color: '#64748B',
        fontSize: 13,
        textAlign: 'right',
    },
});

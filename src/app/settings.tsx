import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, Keyboard, ActivityIndicator, FlatList} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {SafeAreaView} from "react-native-safe-area-context";
import {ParsedClass, ScheduleBasicInfo} from "@/types";
import {fetchLegacySchedule, fetchSchedulesList} from "@/api/universityApi";
import {useSchedule} from "@/context/ScheduleContext";
import {parseLegacySchedule} from "@/utils/parser";

const DAY_NAMES: Record<number, string> = {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    7: 'Niedziela'
};

interface GroupedSubject {
    subjectName: string;
    classes: ParsedClass[];
}

export default function ManageScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { savedClasses, addClass, removeClass } = useSchedule();

    const [activeTab, setActiveTab] = useState<'my_classes' | 'search'>('search');

    const [schedules, setSchedules] = useState<ScheduleBasicInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleBasicInfo | null>(null);
    const [groupedClasses, setGroupedClasses] = useState<GroupedSubject[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    useEffect(() => {
        loadSchedulesList();
    }, []);

    const loadSchedulesList = async () => {
        try {
            setIsLoadingSchedules(true);
            const list = await fetchSchedulesList();

            const validSchedules = list
                .filter(s => s.name && s.name.trim() !== '')
                .sort((a, b) => {
                    const matchA = a.name.match(/^(\d+)\s+(.*)/);
                    const matchB = b.name.match(/^(\d+)\s+(.*)/);
                    const textA = matchA ? matchA[2] : a.name;
                    const textB = matchB ? matchB[2] : b.name;
                    const numA = matchA ? parseInt(matchA[1], 10) : 0;
                    const numB = matchB ? parseInt(matchB[1], 10) : 0;

                    const textCompare = textA.localeCompare(textB, 'pl');
                    if (textCompare !== 0) return textCompare;
                    return numA - numB;
                });

            setSchedules(validSchedules);
        } catch (err) {
            console.error('Błąd pobierania kierunków:', err);
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const handleSelectSchedule = async (schedule: ScheduleBasicInfo) => {
        Keyboard.dismiss();
        setSelectedSchedule(schedule);
        setExpandedSubject(null);
        setIsLoadingClasses(true);

        try {
            const rawData = await fetchLegacySchedule(schedule.id);
            const parsedData = parseLegacySchedule(rawData);

            // Grupowanie zajęć po nazwie przedmiotu
            const grouped: Record<string, ParsedClass[]> = {};
            parsedData.forEach(cls => {
                if (!grouped[cls.subject]) {
                    grouped[cls.subject] = [];
                }
                grouped[cls.subject].push(cls);
            });

            // Konwersja obiektu na tablicę do FlatList
            const groupedArray: GroupedSubject[] = Object.keys(grouped).map(key => ({
                subjectName: key,
                classes: grouped[key]
            }));

            // Sortowanie alfabetyczne przedmiotów
            groupedArray.sort((a, b) => a.subjectName.localeCompare(b.subjectName, 'pl'));

            setGroupedClasses(groupedArray);
        } catch (err) {
            console.error('Błąd pobierania planu:', err);
        } finally {
            setIsLoadingClasses(false);
        }
    };

    const filteredSchedules = schedules.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderScheduleItem = ({ item }: { item: ScheduleBasicInfo }) => (
        <TouchableOpacity
            style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleSelectSchedule(item)}
        >
            <Text style={{ color: colors.text }}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );

    const renderGroupedSubject = ({ item }: { item: GroupedSubject }) => {
        const isExpanded = expandedSubject === item.subjectName;

        return (
            <View style={[styles.accordionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => setExpandedSubject(isExpanded ? null : item.subjectName)}
                >
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>{item.subjectName}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.text}
                        style={{ opacity: 0.5 }}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={[styles.accordionContent, { borderTopColor: colors.border }]}>
                        {item.classes.map(cls => {
                            const isSaved = savedClasses.some(saved => saved.id === cls.id);

                            return (
                                <View key={cls.id} style={[styles.classRow, { borderBottomColor: colors.border }]}>
                                    <View style={styles.classInfo}>
                                        <Text style={{ color: colors.text, fontWeight: '600' }}>
                                            {cls.type} {cls.group ? `- Gr. ${cls.group}` : ''}
                                        </Text>
                                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginTop: 2 }}>
                                            {DAY_NAMES[cls.dayID] || 'Nieznany'}, {cls.startTime}-{cls.endTime} • {cls.room}
                                        </Text>
                                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13 }}>
                                            {cls.lecturer}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            { backgroundColor: isSaved ? '#EF444420' : '#4F46E520' }
                                        ]}
                                        onPress={() => {
                                            if (isSaved) {
                                                removeClass(cls.id);
                                            } else if (selectedSchedule) {
                                                addClass(cls, selectedSchedule.id);
                                            }
                                        }}
                                    >
                                        <Ionicons
                                            name={isSaved ? "trash-outline" : "add"}
                                            size={20}
                                            color={isSaved ? "#EF4444" : "#4F46E5"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Zarządzaj planem</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Gotowe</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my_classes' && { backgroundColor: colors.card }]}
                    onPress={() => setActiveTab('my_classes')}
                >
                    <Text style={[styles.tabText, { color: colors.text }, activeTab !== 'my_classes' && { opacity: 0.5 }]}>
                        Moje zajęcia
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'search' && { backgroundColor: colors.card }]}
                    onPress={() => setActiveTab('search')}
                >
                    <Text style={[styles.tabText, { color: colors.text }, activeTab !== 'search' && { opacity: 0.5 }]}>
                        Wyszukaj
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'search' && (
                    <View style={styles.searchSection}>
                        {!selectedSchedule ? (
                            // Widok 1: Wyszukiwarka kierunków
                            <>
                                <TextInput
                                    style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Wyszukaj kierunek..."
                                    placeholderTextColor={colors.text + '80'}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {isLoadingSchedules ? (
                                    <View
                                    style = {[{alignSelf: "center"}]}
                                        >
                                        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
                                        <Text style={[{ color: colors.text}]}>
                                            Łączenie z serwerami Moria...
                                        </Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={filteredSchedules}
                                        keyExtractor={item => item.id.toString()}
                                        renderItem={renderScheduleItem}
                                        contentContainerStyle={styles.listContainer}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                )}
                            </>
                        ) : (
                            // Widok 2: Przedmioty wybranego kierunku
                            <>
                                <View style={[styles.selectedHeader, { borderBottomColor: colors.border }]}>
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={() => setSelectedSchedule(null)}
                                    >
                                        <Ionicons name="arrow-back" size={24} color="#4F46E5" />
                                        <Text style={styles.backButtonText}>Wróć</Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.selectedTitle, { color: colors.text }]} numberOfLines={1}>
                                        {selectedSchedule.name}
                                    </Text>
                                </View>

                                {isLoadingClasses ? (
                                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
                                ) : (
                                    <FlatList
                                        data={groupedClasses}
                                        keyExtractor={item => item.subjectName}
                                        renderItem={renderGroupedSubject}
                                        contentContainerStyle={styles.listContainer}
                                    />
                                )}
                            </>
                        )}
                    </View>
                )}

                {activeTab === 'my_classes' && (
                    <FlatList
                        data={[...savedClasses].sort((a, b) => {
                            // Sortowanie zapisanych zajęć: najpierw po dniu, potem po godzinie
                            if (a.dayID !== b.dayID) return a.dayID - b.dayID;
                            return a.startTime.localeCompare(b.startTime);
                        })}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.placeholder}>
                                <Text style={{ color: colors.text, opacity: 0.5 }}>Nie masz jeszcze dodanych żadnych zajęć.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View style={[styles.savedClassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.classInfo}>
                                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                                        {item.subject}
                                    </Text>
                                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                                        {item.type} {item.group ? `- Gr. ${item.group}` : ''}
                                    </Text>
                                    <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                                        {DAY_NAMES[item.dayID] || 'Nieznany'}, {item.startTime}-{item.endTime} • {item.room}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
                                    onPress={() => removeClass(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, paddingTop: Platform.OS === 'ios' ? 20 : 16, borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeButton: { padding: 4 },
    closeButtonText: { fontSize: 16, fontWeight: '600', color: '#4F46E5' },
    tabsContainer: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabText: { fontSize: 14, fontWeight: '600' },
    content: { flex: 1 },
    searchSection: { flex: 1 },
    searchInput: { margin: 16, height: 40, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1 },
    listContainer: { padding: 16, paddingBottom: 40, gap: 10 },
    listItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 8,
    },
    selectedHeader: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    backButtonText: { color: '#4F46E5', fontSize: 16, fontWeight: '500', marginLeft: 4 },
    selectedTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
    accordionContainer: { borderRadius: 8, borderWidth: 1, marginBottom: 8, overflow: 'hidden' },
    accordionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
    },
    accordionTitle: { fontSize: 15, fontWeight: '600', flex: 1, paddingRight: 10 },
    accordionContent: { borderTopWidth: 1 },
    classRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1,
    },
    classInfo: { flex: 1, paddingRight: 12 },
    actionButton: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    savedClassCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
});
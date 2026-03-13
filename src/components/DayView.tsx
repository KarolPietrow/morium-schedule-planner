import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { useSchedule } from '@/context/ScheduleContext';
import { ParsedClass } from '@/types';
import { useTheme } from "@react-navigation/core";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import FreeDay from "@/components/FreeDay";
import EmptyPlan from "@/components/EmptyPlan";

interface DayViewProps {
    dayName: string; // Dzień tygodnia
}

const HOUR_HEIGHT = 80; // Ile pikseli zajmuje jedna godzina na ekranie
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

// Zamiana czasu na minuty od północy
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export default function DayView({ dayName }: DayViewProps) {
    const { savedClasses, isLoading } = useSchedule();
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const topPadding = insets.top > 0
        ? insets.top
        : (initialWindowMetrics?.insets.top ?? 47);

    const isPlanEmpty = savedClasses.length === 0;

    const dayClasses = savedClasses
        .filter(c => c.day === dayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let minHour = 10;
    let maxHour = 20;

    if (dayClasses.length > 0) {
        dayClasses.forEach(cls => {
            const startH = parseInt(cls.startTime.split(':')[0], 10);
            const endH = parseInt(cls.endTime.split(':')[0], 10);
            if (startH < minHour) minHour = startH;
            if (endH > maxHour) maxHour = endH + 1;
        });
    }

    const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

    if (isPlanEmpty) {
        return <EmptyPlan/>
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
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
            ) : (dayClasses.length === 0) ? (
                <FreeDay/>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Główny kontener siatki */}
                    <View style={{ height: (maxHour - minHour) * HOUR_HEIGHT, position: 'relative', marginTop: 10 }}>

                        {/* 1. Rysowanie linii godzinowych */}
                        {hours.map(hour => (
                            <View
                                key={hour}
                                style={[styles.gridLineContainer, { top: (hour - minHour) * HOUR_HEIGHT }]}
                            >
                                <Text style={[styles.timeLabel, { color: colors.text }]}>
                                    {`${hour}:00`}
                                </Text>
                                <View style={[styles.gridLine, { borderBottomColor: colors.border }]} />
                            </View>
                        ))}

                        {/* 2. Rysowanie kafelków zajęć */}
                        {dayClasses.map(cls => {
                            const startMins = timeToMinutes(cls.startTime);
                            const endMins = timeToMinutes(cls.endTime);
                            const durationMins = endMins - startMins;

                            // Obliczanie pozycji (odstęp od góry) i wysokości kafelka
                            const topPosition = (startMins - minHour * 60) * PIXELS_PER_MINUTE;
                            const classHeight = durationMins * PIXELS_PER_MINUTE;

                            const isShortClass = durationMins <= 55;

                            return (
                                <TouchableOpacity
                                    key={cls.id}
                                    style={[
                                        styles.classCard,
                                        {
                                            top: topPosition,
                                            height: classHeight,
                                            backgroundColor: colors.card,
                                            borderColor: colors.border,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 2,
                                        }
                                    ]}
                                    onPress={() => console.log('Kliknięto:', cls.subject)}
                                >
                                    <View style={styles.cardIndicator} />
                                    <View style={styles.cardContent}>
                                        {/* Linia 1: Przedmiot */}
                                        <Text style={[styles.classSubject, { color: colors.text }]}
                                              numberOfLines={isShortClass ? 1 : 2}
                                        >
                                            {cls.subject}
                                        </Text>

                                        {/* Linia 2: Czas i Sala */}
                                        <View style={styles.detailsRow}>
                                            <View style={styles.iconText}>
                                                <Ionicons name="time-outline" size={15} color={colors.text} style={styles.icon} />
                                                <Text style={[styles.infoText, { color: colors.text }]}>
                                                    {cls.startTime} - {cls.endTime}
                                                </Text>
                                            </View>
                                            <View style={[styles.iconText, { flexShrink: 1, paddingLeft: 8 }]}>
                                                <Ionicons name="location-outline" size={15} color={colors.text} style={styles.icon} />
                                                <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
                                                    {cls.room}
                                                </Text>
                                            </View>
                                        </View>

                                        {!isShortClass && (
                                            <>
                                                <View style={styles.detailsRow}>
                                                    <View style={[styles.iconText, { flexShrink: 1 }]}>
                                                        <Ionicons name="person-outline" size={15} color={colors.text} style={styles.icon} />
                                                        <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
                                                            {cls.lecturer}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Linia 4: Pigułki (Chipy) */}
                                                <View style={styles.pillsRow}>
                                                    <View style={[styles.pill, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                                                        <Text style={styles.typePillText}>{cls.type}</Text>
                                                    </View>
                                                    {cls.group && (
                                                        <View style={[styles.pill, { backgroundColor: 'rgba(100, 116, 139, 0.15)' }]}>
                                                            <Text style={[styles.groupPillText, { color: colors.text }]}>Gr. {cls.group}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15,
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold' },
    manageButton: { padding: 4 },
    statusText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
    scrollContent: {
        paddingBottom: 120, // Miejsce pod paskiem dolnym
    },
    gridLineContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timeLabel: {
        width: 50,
        textAlign: 'right',
        paddingRight: 8,
        fontSize: 12,
        opacity: 0.6,
        marginTop: -7, // Wyrównanie tekstu do linii
    },
    gridLine: {
        flex: 1,
        borderBottomWidth: 1,
        opacity: 0.5,
    },
    classCard: {
        position: 'absolute',
        left: 55,
        right: 15,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        overflow: 'hidden', // Gwarantuje ucinanie dolnych linijek, gdy kafelek jest mały
    },
    cardIndicator: {
        width: 4,
        backgroundColor: '#4F46E5',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 8,
        justifyContent: 'flex-start', // Zmiana z 'center' na 'flex-start'
    },
    classSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        opacity: 0.6,
        marginRight: 4,
    },
    infoText: {
        fontSize: 15,
        opacity: 0.8,
    },
    pillsRow: {
        flexDirection: 'row',
        marginTop: 2,
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 6,
        marginTop: 4,
    },
    typePillText: {
        color: '#4F46E5',
        fontSize: 13,
        fontWeight: '700',
    },
    groupPillText: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.8,
    },
});
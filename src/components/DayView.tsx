import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator} from 'react-native';
import { useSchedule } from '@/context/ScheduleContext';
import { RefreshResult } from '@/types';
import { useTheme } from "@react-navigation/core";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import FreeDay from "@/components/FreeDay";
import EmptyPlan from "@/components/EmptyPlan";

// TODO: Tłumaczenie na inne języki
const DAY_NAMES: Record<number, string> = {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    7: 'Niedziela'
};

interface DayViewProps {
    dayID: number; // Dzień tygodnia
}

const HOUR_HEIGHT = 80; // Ile pikseli zajmuje jedna godzina na ekranie
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

// Zamiana czasu na minuty od północy
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatGapDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min okienka`;
    if (h > 0) return `${h}h okienka`;
    return `${m}min okienka`;
};

interface ClassCardProps {
    cls: any;
    colors: any;
    topPosition: number;
    classHeight: number;
    onPress: () => void;
}

const CARD_PADDING_VERTICAL = 19;

function ClassCard({ cls, colors, topPosition, classHeight, onPress }: ClassCardProps) {
    const [contentHeight, setContentHeight] = useState(Infinity);
    const [rowHeights, setRowHeights] = useState<Record<string, number>>({});

    const startMins = timeToMinutes(cls.startTime);
    const endMins = timeToMinutes(cls.endTime);
    const durationMins = endMins - startMins;
    const isShortClass = durationMins <= 55;


    const setRowHeight = (key: string) => (e: any) => {
        const h = e.nativeEvent.layout.height;
        setRowHeights(prev => (prev[key] === h ? prev : { ...prev, [key]: h }));
    };

    const usable = contentHeight - CARD_PADDING_VERTICAL;

    const hSubject  = rowHeights.subject   ?? 0;
    const hTime     = rowHeights.time      ?? 0;
    const hLecturer = rowHeights.lecturer  ?? 0;
    const hPills    = rowHeights.pills     ?? 0;

    let cumulative = hSubject;
    const showTime     = cumulative + hTime     <= usable; if (showTime)     cumulative += hTime;
    const showLecturer = showTime && cumulative + hLecturer <= usable; if (showLecturer) cumulative += hLecturer;
    const showPills    = showLecturer && cumulative + hPills <= usable;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
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
            onPress={onPress}
        >
            <View style={styles.cardIndicator} />
            <View
                style={styles.cardContent}
                onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
            >
                <Text
                    style={[styles.classSubject, { color: colors.text }]}
                    numberOfLines={isShortClass ? 1 : 2}
                    onLayout={setRowHeight('subject')}
                >
                    {cls.subject}
                </Text>


                <View style={styles.detailsRow} onLayout={setRowHeight('time')}>
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

                {showLecturer && (
                    <View style={styles.detailsRow} onLayout={setRowHeight('lecturer')}>
                        <View style={[styles.iconText, { flexShrink: 1 }]}>
                            <Ionicons name="person-outline" size={15} color={colors.text} style={styles.icon} />
                            <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
                                {cls.lecturer}
                            </Text>
                        </View>
                    </View>
                )}

                {showPills && (
                    <View style={styles.pillsRow} onLayout={setRowHeight('pills')}>
                        <View style={[styles.pill, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                            <Text style={styles.typePillText}>{cls.type}</Text>
                        </View>
                        {cls.group && (
                            <View style={[styles.pill, { backgroundColor: 'rgba(100, 116, 139, 0.15)' }]}>
                                <Text style={[styles.groupPillText, { color: colors.text }]}>Gr. {cls.group}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}


export default function DayView({ dayID }: DayViewProps) {
    const { savedClasses, isLoading, isRefreshing, refreshSchedule } = useSchedule();
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [currentTimeData, setCurrentTimeData] = useState({ isToday: false, minutes: 0 });

    const updateTime = () => {
        const plDate = new Date();
        const jsDay = plDate.getDay();
        const currentDayID = jsDay === 0 ? 7 : jsDay;
        setCurrentTimeData({
            isToday: currentDayID === dayID,
            minutes: plDate.getHours() * 60 + plDate.getMinutes(),
        });
    };

    const handleRefresh = async () => {
        const result = await refreshSchedule();

        switch (result) {
            case 'UPDATED':
                Alert.alert("Zaktualizowano plan", "Pobrano nowe dane z serwerów Moria.");
                break;
            case 'UP_TO_DATE':
                Alert.alert("Plan aktualny", "Nie znaleziono zmian na serwerach Moria.");
                break;
            case 'FAILED':
                Alert.alert("Błąd aktualizacji planu", "Upewnij się, że serwery Moria są dostępne.");
                break;
        }
    };

    useEffect(() => {
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [dayID]);

    const topPadding = insets.top > 0
        ? insets.top
        : (initialWindowMetrics?.insets.top ?? 47);

    const isPlanEmpty = savedClasses.length === 0;

    const dayName = DAY_NAMES[dayID] || 'N/A';

    const dayClasses = savedClasses
        .filter(c => c.dayID === dayID)
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

    const gaps = [];
    for (let i = 0; i < dayClasses.length - 1; i++) {
        const currentClass = dayClasses[i];
        const nextClass = dayClasses[i + 1];

        const endMins = timeToMinutes(currentClass.endTime);
        const nextStartMins = timeToMinutes(nextClass.startTime);
        const gapMins = nextStartMins - endMins;

        if (gapMins >= 45) {
            gaps.push({
                id: `gap-${i}`,
                startMins: endMins,
                durationMins: gapMins,
            });
        }
    }

    if (isPlanEmpty) {
        return <EmptyPlan/>
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{dayName}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={styles.actionButton}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator size="small" color={colors.text} />
                        ) : (
                            <Ionicons name="refresh-outline" size={28} color={colors.text} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        style={styles.actionButton}
                    >
                        <Ionicons name="options-outline" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
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

                        {/* Rysowanie linii godzinowych */}
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

                        {gaps.map(gap => (
                            <View
                                key={gap.id}
                                style={[
                                    styles.gapContainer,
                                    {
                                        top: (gap.startMins - minHour * 60) * PIXELS_PER_MINUTE,
                                        height: gap.durationMins * PIXELS_PER_MINUTE,
                                    }
                                ]}
                            >
                                <View style={[styles.gapPill, { backgroundColor: colors.border }]}>
                                    <Ionicons name="cafe-outline" size={14} color={colors.text} style={{ opacity: 0.8, marginRight: 6 }} />
                                    <Text style={[styles.gapText, { color: colors.text }]}>
                                        {formatGapDuration(gap.durationMins)}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* Rysowanie kafelków zajęć */}
                        {dayClasses.map(cls => {
                            const startMins = timeToMinutes(cls.startTime);
                            const endMins = timeToMinutes(cls.endTime);
                            const durationMins = endMins - startMins;

                            // Obliczanie pozycji (odstęp od góry) i wysokości kafelka
                            const topPosition = (startMins - minHour * 60) * PIXELS_PER_MINUTE;
                            const classHeight = durationMins * PIXELS_PER_MINUTE;

                            return (
                                <ClassCard
                                    key={cls.id}
                                    cls={cls}
                                    colors={colors}
                                    topPosition={topPosition}
                                    classHeight={classHeight}
                                    onPress={() => console.log('Kliknięto:', cls.subject)}
                                />

                            );
                        })}

                        {currentTimeData.isToday && currentTimeData.minutes >= minHour * 60 && currentTimeData.minutes <= maxHour * 60 && (
                            <View
                                style={[
                                    styles.currentTimeContainer,
                                    {
                                        top: (currentTimeData.minutes - minHour * 60) * PIXELS_PER_MINUTE
                                    }
                                ]}
                            >
                                {/*<View style={styles.currentTimeDot} />*/}
                                <View style={styles.currentTimeLine} />
                            </View>
                        )}

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
        paddingBottom: 120,
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
        marginTop: -7,
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
        overflow: 'hidden',
    },
    cardIndicator: {
        width: 4,
        backgroundColor: '#4F46E5',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 8,
        justifyContent: 'flex-start',
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
    currentTimeContainer: {
        position: 'absolute',
        // left: 45,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        // zIndex: 50,
        zIndex: -1,
        transform: [{ translateY: -4 }],
    },
    currentTimeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        opacity: 1
    },
    currentTimeLine: {
        flex: 1,
        height: 3,
        backgroundColor: '#EF4444',
        opacity: 1
    },
    gapContainer: {
        position: 'absolute',
        left: 55,
        right: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    gapPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        opacity: 0.8,
    },
    gapText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 4,
        marginLeft: 12,
    },
});
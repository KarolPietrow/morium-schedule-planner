import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from "@/context/ScheduleContext";

const DAY_NAMES: Record<number, string> = {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    7: 'Niedziela'
};

export default function MyClasses() {
    const { colors } = useTheme();
    const { savedClasses, removeClass } = useSchedule();

    return (
        <FlatList
            data={[...savedClasses].sort((a, b) => {
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
    );
}

const styles = StyleSheet.create({
    listContainer: { padding: 16, paddingBottom: 40, gap: 10 },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    savedClassCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
    classInfo: { flex: 1, paddingRight: 12 },
    actionButton: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
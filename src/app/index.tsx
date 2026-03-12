import React from 'react';
import {Redirect, Tabs, useRouter} from 'expo-router';
import { StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '@/context/ScheduleContext';

export default function Index() {
    return <Redirect href="/(tabs)/monday" />;

    // const { colors } = useTheme();
    // const { savedClasses, isLoading } = useSchedule();
    // const router = useRouter();

    // if (isLoading) {
    //     return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    // }
    //
    // if (savedClasses.length === 0) {
    //     return (
    //         <View style={[styles.emptyContainer, {backgroundColor: colors.background}]}>
    //             <Ionicons
    //                 name="calendar-outline"
    //                 size={80}
    //                 color={colors.text}
    //                 style={{opacity: 0.2, marginBottom: 24}}
    //             />
    //             <Text style={[styles.emptyTitle, {color: colors.text}]}>Twój plan jest pusty</Text>
    //             <Text style={[styles.emptySubtitle, {color: colors.text}]}>
    //                 Dodaj swoje pierwsze zajęcia, wybierając kierunek z wyszukiwarki.
    //             </Text>
    //             <TouchableOpacity
    //                 style={styles.addButton}
    //                 onPress={() => router.push('/settings')}
    //             >
    //                 <Ionicons name="add" size={24} color="#FFFFFF" style={{marginRight: 8}}/>
    //                 <Text style={styles.addButtonText}>Zarządzaj planem</Text>
    //             </TouchableOpacity>
    //         </View>
    //     );
    // } else {
    //     router.push('/(tabs)/monday');
    // }
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
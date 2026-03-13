import React, { useEffect, useRef } from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {useRouter} from "expo-router";

export default function EmptyPlan() {
    const router = useRouter();
    const { colors } = useTheme();

    return (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-clear-outline" size={64} color={colors.text} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Twój plan jest pusty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text }]}>
                Nie masz zaplanowanych żadnych zajęć. Dodaj coś do swojego planu, aby zacząć!
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/settings')}>
                <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Dodaj zajęcia</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 16,
        opacity: 0.5,
        textAlign: 'center',
        lineHeight: 24,
    },
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
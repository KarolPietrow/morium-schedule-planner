import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FreeDay() {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Ionicons
                name="partly-sunny-outline"
                size={100}
                color={colors.text}
                style={[styles.icon, { opacity: 0.15 }]}
            />
            <Text style={[styles.title, { color: colors.text }]}>Wolne :)</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
                Brak zaplanowanych zajęć na dziś.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: -100,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.5,
        textAlign: 'center',
        lineHeight: 24,
    },
});
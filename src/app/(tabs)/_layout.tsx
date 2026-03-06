import {DarkTheme, DefaultTheme, ThemeProvider, useTheme} from "@react-navigation/native";
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import React from "react";
import {NativeTabs} from "expo-router/unstable-native-tabs";
import {useSchedule} from "@/context/ScheduleContext";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";


export default function TabLayout() {
    const {colors} = useTheme();
    const {savedClasses, isLoading} = useSchedule();
    const router = useRouter();

    if (isLoading) {
        return <View style={{flex: 1, backgroundColor: colors.background}}/>;
    }

    const isPlanEmpty = savedClasses.length === 0;
    const activeDays = new Set(savedClasses.map(c => c.day));

    return (
        <NativeTabs>
            <NativeTabs.Trigger name="monday">
                <NativeTabs.Trigger.Label>Poniedz.</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="tuesday">
                <NativeTabs.Trigger.Label>Wtorek</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="wednesday">
                <NativeTabs.Trigger.Label>Środa</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="thursday">
                <NativeTabs.Trigger.Label>Czwartek</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="friday">
                <NativeTabs.Trigger.Label>Piątek</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
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
        shadowOffset: {width: 0, height: 4},
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
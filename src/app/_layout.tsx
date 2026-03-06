import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import {Platform, StatusBar, useColorScheme} from 'react-native';
import React, {useEffect } from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Stack } from "expo-router";
import {ScheduleProvider, useSchedule} from "@/context/ScheduleContext";
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
    return (
        <ScheduleProvider>
            <MainLayout/>
        </ScheduleProvider>
    )
}

function MainLayout() {
    const colorScheme = useColorScheme();
    const { savedClasses, isLoading } = useSchedule();

    const isPlanEmpty = savedClasses.length === 0;

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light');
        }
    }, [colorScheme]);

    // useEffect(() => {
    //     if (isPlanEmpty) {
    //         if (router.scree)
    //     }
    // }, [isPlanEmpty]);

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar barStyle={(colorScheme === 'dark' ? "light-content" : "dark-content")} />
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="(tabs)"
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="settings"
                    options={{headerShown: false}}
                />
            </Stack>
        </ThemeProvider>
    )
}

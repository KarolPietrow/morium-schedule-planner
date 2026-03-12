import { useTheme } from "@react-navigation/native";
import {Platform, View, Image} from 'react-native';
import React, {useEffect} from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useSchedule } from "@/context/ScheduleContext";
import {Redirect, Tabs} from "expo-router";

export default function TabLayout() {
    const { colors } = useTheme();
    const { savedClasses, isLoading } = useSchedule();

    if (isLoading) {
        return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }

    const isPlanEmpty = savedClasses.length === 0;

    if (Platform.OS === "ios") {
        return (
            <NativeTabs
                labelVisibilityMode="unlabeled"
                hidden={isPlanEmpty}
            >
                {/*{activeDays.has('Poniedziałek') && (*/}
                <NativeTabs.Trigger name="monday"
                    // hidden={!activeDays.has('Poniedziałek')}
                >
                    <NativeTabs.Trigger.Label
                        hidden={true}
                    >Poniedz.</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon src={require('@/assets/images/weekIconsPL/pn.png')} renderingMode="template" />
                </NativeTabs.Trigger>
                {/*)}*/}

                {/*{activeDays.has('Wtorek') && (*/}
                <NativeTabs.Trigger name="tuesday"
                    // hidden={!activeDays.has('Wtorek')}
                >
                    <NativeTabs.Trigger.Label hidden={true}>Wtorek</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon src={require('@/assets/images/weekIconsPL/wt.png')} renderingMode="template" />
                </NativeTabs.Trigger>
                {/*)}*/}

                {/*{activeDays.has('Środa') && (*/}
                <NativeTabs.Trigger name="wednesday"
                    // hidden={!activeDays.has('Środa')}
                >
                    <NativeTabs.Trigger.Label hidden={true}>Środa</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon src={require('@/assets/images/weekIconsPL/sr.png')} renderingMode="template" />
                </NativeTabs.Trigger>

                {/*{activeDays.has('Czwartek') && (*/}
                <NativeTabs.Trigger name="thursday"
                    // hidden={!activeDays.has('Czwartek')}
                >
                    <NativeTabs.Trigger.Label hidden={true}>Czwartek</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon src={require('@/assets/images/weekIconsPL/cz.png')} renderingMode="template" />
                </NativeTabs.Trigger>
                {/*)}*/}

                {/*{activeDays.has('Piątek') && (*/}
                <NativeTabs.Trigger name="friday"
                    // hidden={!activeDays.has('Piątek')}
                >
                    <NativeTabs.Trigger.Label hidden={true}>Piątek</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon src={require('@/assets/images/weekIconsPL/pt.png')} renderingMode="template" />
                </NativeTabs.Trigger>
                {/*)}*/}
            </NativeTabs>
        )
    } else {
        return (
            <Tabs
                screenOptions={{
                    tabBarStyle: isPlanEmpty ? { display: 'none' } : undefined,
                    tabBarShowLabel: false,
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="monday"
                    options={{
                        title: 'Poniedz.',
                        tabBarIcon: ({ color, size }) => (
                            <Image
                                source={require('@/assets/images/weekIconsPL/pn.png')}
                                style={{ width: 30, height: 30, tintColor: color }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tuesday"
                    options={{
                        title: 'Wtorek',
                        tabBarIcon: ({ color, size }) => (
                            <Image
                                source={require('@/assets/images/weekIconsPL/wt.png')}
                                style={{ width: 30, height: 30, tintColor: color }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="wednesday"
                    options={{
                        title: 'Środa',
                        tabBarIcon: ({ color, size }) => (
                            <Image
                                source={require('@/assets/images/weekIconsPL/sr.png')}
                                style={{ width: 30, height: 30, tintColor: color }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="thursday"
                    options={{
                        title: 'Czwartek',
                        tabBarIcon: ({ color, size }) => (
                            <Image
                                source={require('@/assets/images/weekIconsPL/cz.png')}
                                style={{ width: 30, height: 30, tintColor: color }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="friday"
                    options={{
                        title: 'Piątek',
                        tabBarIcon: ({ color, size }) => (
                            <Image
                                source={require('@/assets/images/weekIconsPL/pt.png')}
                                style={{ width: 30, height: 30, tintColor: color }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
            </Tabs>
        )
    }
}
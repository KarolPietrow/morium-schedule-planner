import React from 'react';
import {Href, Redirect, Tabs, useRouter} from 'expo-router';
import {useSchedule} from "@/context/ScheduleContext";

export default function Index() {
    // const { isLoading, savedClasses } = useSchedule()

    // const plTimeString = new Date().("en-US", { timeZone: "Europe/Warsaw" });
    // const plDate = new Date(plTimeString);
    const dayIndex = new Date().getDay();

    // TODO: Obsługa zajęć weekendowych
    // const activeDayIds = new Set(savedClasses.map(c => c.dayID));
    // const hasWeekendClasses = activeDayIds.has(6) || activeDayIds.has(7);
    const hasWeekendClasses = false

    const indexToTab: Record<number, string> = {
        0: hasWeekendClasses ? 'sunday' : 'monday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: hasWeekendClasses ? 'saturday' : 'monday',
    };

    const targetTab = indexToTab[dayIndex] || 'monday';

    return <Redirect href={`/(tabs)/${targetTab}` as Href} />;

}
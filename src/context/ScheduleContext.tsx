import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SavedClass, ParsedClass, RefreshResult} from '@/types';
import {fetchLegacySchedule} from "@/api/universityApi";
import {parseLegacySchedule} from "@/utils/parser";

interface ScheduleContextType {
    savedClasses: SavedClass[];
    addClass: (cls: ParsedClass, scheduleId: number) => Promise<void>;
    removeClass: (classId: string) => Promise<void>;
    refreshSchedule: () => Promise<RefreshResult>
    isLoading: boolean;
    isRefreshing: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEY = '@my_schedule';

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const storedData = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedData) {
                setSavedClasses(JSON.parse(storedData));
            }
        } catch (error) {
            console.error('Błąd podczas ładowania zapisanego planu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addClass = async (cls: ParsedClass, scheduleId: number) => {
        try {
            if (savedClasses.some(c => c.id === cls.id)) {
                return;
            }

            const newClass: SavedClass = { ...cls, scheduleId };
            const updatedSchedule = [...savedClasses, newClass];

            setSavedClasses(updatedSchedule);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedule));
        } catch (error) {
            console.error('Błąd podczas dodawania zajęć:', error);
        }
    };

    const removeClass = async (classId: string) => {
        try {
            const updatedSchedule = savedClasses.filter(c => c.id !== classId);

            setSavedClasses(updatedSchedule);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedule));
        } catch (error) {
            console.error('Błąd podczas usuwania zajęć:', error);
        }
    };

    const refreshSchedule = async (): Promise<RefreshResult> => {
        if (savedClasses.length === 0) return 'UP_TO_DATE';

        setIsRefreshing(true);
        try {
            // ID kierunków do odświeżenia z planu użytkownika
            const uniqueScheduleIds = Array.from(new Set(savedClasses.map(c => c.scheduleId)));

            const successfulScheduleIds = new Set<number>();
            const freshClassesMap = new Map<string, ParsedClass>();

            const fetchPromises = uniqueScheduleIds.map(async (id) => {
                try {
                    const rawData = await fetchLegacySchedule(id);
                    const parsedData = parseLegacySchedule(rawData);
                    return { scheduleId: id, classes: parsedData, success: true };
                } catch (error) {
                    console.error(`Nie udało się pobrać planu dla kierunku ID: ${id}`, error);
                    return { scheduleId: id, classes: [], success: false };
                }
            });
            const results = await Promise.all(fetchPromises);

            results.forEach(result => {
                if (result.success) {
                    successfulScheduleIds.add(result.scheduleId);
                    result.classes.forEach(cls => {
                        freshClassesMap.set(cls.id, cls);
                    });
                }
            });

            if (successfulScheduleIds.size === 0 && uniqueScheduleIds.length > 0) {
                return 'FAILED';
            }

            const updatedClasses: SavedClass[] = [];

            savedClasses.forEach(savedCls => {
                if (!successfulScheduleIds.has(savedCls.scheduleId)) {
                    updatedClasses.push(savedCls);
                    return;
                }

                const freshCls = freshClassesMap.get(savedCls.id);

                if (freshCls) {
                    updatedClasses.push({
                        ...freshCls,
                        scheduleId: savedCls.scheduleId,
                    });
                }
            });

            if (JSON.stringify(savedClasses) !== JSON.stringify(updatedClasses)) {
                setSavedClasses(updatedClasses);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClasses));
                return 'UPDATED';
            } else {
                return 'UP_TO_DATE';
            }
        } catch (error) {
            console.error('Błąd podczas odświeżania planów:', error);
            return 'FAILED'
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <ScheduleContext.Provider value={{
            savedClasses, addClass, removeClass, refreshSchedule, isLoading, isRefreshing
        }}>
            {children}
        </ScheduleContext.Provider>
    );

};

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be wrapped in a <ScheduleProvider />');
    }
    return context;
}
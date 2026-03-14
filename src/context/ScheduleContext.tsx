import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedClass, ParsedClass } from '@/types';

interface ScheduleContextType {
    savedClasses: SavedClass[];
    addClass: (cls: ParsedClass, scheduleId: number) => Promise<void>;
    removeClass: (classId: string) => Promise<void>;
    isLoading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEY = '@my_schedule';

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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

    return (
        <ScheduleContext.Provider
            value={{ savedClasses, addClass, removeClass, isLoading }}>
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
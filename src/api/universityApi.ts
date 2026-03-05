import { ScheduleBasicInfo, StudentsListApiResponse } from "@/types";

const BASE_URL = 'https://moria.umcs.lublin.pl';

/**
 * Pobiera listę wszystkich dostępnych planów (kierunków, roczników, grup).
 * Zwraca surową tablicę obiektów: { id: number, name: string }
 */
export const fetchSchedulesList = async (): Promise<ScheduleBasicInfo[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/students_list`);

        if (!response.ok) {
            throw new Error(`Błąd serwera API: ${response.status}`);
        }

        const data = await response.json();

        // API zwraca obiekt z polem "result", w którym jest "array"
        if (data.status === 'ok' && data.result && data.result.array) {
            return data.result.array;
        } else {
            throw new Error('Nieoczekiwany format odpowiedzi z API');
        }
    } catch (error) {
        console.error('Błąd pobierania listy kierunków:', error);
        throw error;
    }
};

/**
 * Pobiera surowe dane konkretnego planu z "Legacy API".
 * Zwraca długi ciąg znaków (String) z danymi oddzielonymi tabulacjami.
 * @param {number} scheduleId - ID planu (np. 840)
 */
export const fetchLegacySchedule = async (scheduleId: number | string): Promise<string> => {
    try {
        const response = await fetch(`${BASE_URL}/api/legacy/${scheduleId}`);

        if (!response.ok) {
            throw new Error(`Błąd serwera Legacy API: ${response.status}`);
        }

        const textData = await response.text();
        return textData;

    } catch (error) {
        console.error(`Błąd pobierania planu o ID ${scheduleId}:`, error);
        throw error;
    }
};
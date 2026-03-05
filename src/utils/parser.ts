import { ParsedClass } from '@/types';

const DAYS_MAP: Record<number, string> = {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    7: 'Niedziela'
};

/**
 * Dodaje czas trwania do godziny rozpoczęcia.
 * Np. startTime: "08:15", duration: "01:30" => zwraca "09:45"
 */
const calculateEndTime = (startTime: string, duration: string): string => {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [durHours, durMins] = duration.split(':').map(Number);

    let endMins = startMins + durMins;
    let endHours = startHours + durHours + Math.floor(endMins / 60);
    endMins = endMins % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};

/**
 * Helper do budowania obiektów ze słowników Morii.
 * Zamienia tablicę linii na słownik { "ID": "Wartość" }
 */
const buildDictionary = (lines: string[]): Record<string, string> => {
    const dict: Record<string, string> = {};
    lines.forEach(line => {
        const cols = line.trim().split('\t');
        if (cols.length >= 2) {
            const id = cols[0];
            const name = cols[1];
            dict[id] = name;
        }
    });
    return dict;
};

// Wyciąga zawartość pojedynczego tagu, np. <name>Wykład</name> -> "Wykład"
const extractTag = (xml: string, tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
};

// Wyciąga wszystkie bloki danego tagu jako tablicę
const extractAllTags = (xml: string, tag: string): string[] => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
        matches.push(match[1]);
    }
    return matches;
};

export const parseLegacySchedule = (rawXml: string): ParsedClass[] => {
    if (!rawXml || !rawXml.includes('<activities>')) return [];

    const subjectsMap: Record<string, string> = {};
    const typesMap: Record<string, string> = {};
    const lecturersMap: Record<string, string> = {};
    const roomsMap: Record<string, string> = {};

    extractAllTags(rawXml, 'subject').forEach(xml => {
        const id = extractTag(xml, 'id');
        if (id) subjectsMap[id] = extractTag(xml, 'name');
    });

    extractAllTags(rawXml, 'type').forEach(xml => {
        const id = extractTag(xml, 'id');
        if (id) {
            let typeName = extractTag(xml, 'name');
            typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1).toLowerCase();
            typesMap[id] = typeName;
        }
    });

    extractAllTags(rawXml, 'teacher').forEach(xml => {
        const id = extractTag(xml, 'id');
        // Weryfikacja obecności <id> odfiltrowuje tagi <teacher> ze środka <activity>
        if (id) {
            const firstName = extractTag(xml, 'first_name');
            const lastName = extractTag(xml, 'last_name');
            const degree = extractTag(xml, 'degree');
            lecturersMap[id] = `${degree} ${firstName} ${lastName}`.trim();
        }
    });

    extractAllTags(rawXml, 'room').forEach(xml => {
        const id = extractTag(xml, 'id');
        if (id) roomsMap[id] = extractTag(xml, 'name');
    });

    const parsedSchedule: ParsedClass[] = [];
    const activitiesSection = extractTag(rawXml, 'activities');

    extractAllTags(activitiesSection, 'activity').forEach(actXml => {
        const id = extractTag(actXml, 'id');
        const subjectId = extractTag(actXml, 'subject');
        const typeId = extractTag(actXml, 'type');
        const roomId = extractTag(actXml, 'room');

        const teachersBlock = extractTag(actXml, 'teachers');
        const lecturerId = extractTag(teachersBlock, 'teacher');

        const plannedBlock = extractTag(actXml, 'planned');
        const dayId = parseInt(extractTag(plannedBlock, 'weekday'), 10);
        const startTime = extractTag(plannedBlock, 'start_time');
        const duration = extractTag(plannedBlock, 'work_length');
        const group = extractTag(actXml, 'group');

        if (startTime) {
            const endTime = calculateEndTime(startTime, duration);

            parsedSchedule.push({
                id,
                subject: subjectsMap[subjectId] || 'Nieznany przedmiot',
                type: typesMap[typeId] || 'Inne',
                lecturer: lecturersMap[lecturerId] || '-',
                room: roomsMap[roomId] || 'Brak sali',
                day: DAYS_MAP[dayId] || 'Nieznany',
                startTime,
                endTime,
                group: group && group !== '0' ? group : null,
            });
        }
    });

    return parsedSchedule.sort((a, b) => {
        const dayA = Object.keys(DAYS_MAP).find(key => DAYS_MAP[Number(key)] === a.day) || '8';
        const dayB = Object.keys(DAYS_MAP).find(key => DAYS_MAP[Number(key)] === b.day) || '8';

        if (dayA !== dayB) return Number(dayA) - Number(dayB);
        return a.startTime.localeCompare(b.startTime);
    });
};
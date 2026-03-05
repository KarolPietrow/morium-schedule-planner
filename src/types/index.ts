export interface ScheduleBasicInfo {
    id: number;
    name: string;
}

export interface ParsedClass {
    id: string;
    subject: string;
    type: string;
    lecturer: string;
    room: string;
    day: string;
    startTime: string;
    endTime: string;
    group: string | null;
}

export interface SavedClass extends ParsedClass {
    scheduleId: number;
    // isCustom?: boolean;
}

export interface StudentsListApiResponse {
    result: {
        array: ScheduleBasicInfo[];
        count: number;
    };
    status: string;
}
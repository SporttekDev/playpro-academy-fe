export type ScheduleStatus = "Available" | "Almost Full" | "Full";

export type ScheduleItem = {
    id: number;
    sportName: string;
    categoryName: string;
    ageRange: string | null;
    className: string;
    branchName: string;
    venueName: string;
    date: string;
    dateLabel: string;
    startTime: string;
    endTime: string;
    quota: number;
    slotsRemaining: number;
    status: ScheduleStatus;
    coachName: string | null;
};
import { RawSchedule } from "./client";
import { ScheduleItem, ScheduleStatus } from "./types";

function formatDateLabel(iso: string): string {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

function formatTime(time: string): string {
    return time.slice(0, 5); // "15:00:00" -> "15:00"
}

export function mapRawToScheduleItem(raw: RawSchedule): ScheduleItem {
    return {
        id: raw.id,
        sportName: raw.sport.name ?? "-",
        categoryName: raw.category.name ?? "-",
        ageRange: raw.category.age_range,
        className: raw.class_name,
        branchName: raw.branch.name ?? "-",
        venueName: raw.venue.name ?? "-",
        date: raw.date,
        dateLabel: formatDateLabel(raw.date),
        startTime: formatTime(raw.start_time),
        endTime: formatTime(raw.end_time),
        quota: raw.quota,
        slotsRemaining: raw.slots_remaining,
        status: raw.status as ScheduleStatus,
        coachName: raw.coach_name,
    };
}
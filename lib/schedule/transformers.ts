import { RawSchedule } from "./client";
import { ScheduleItem, ScheduleStatus } from "./types";

function formatDateLabel(iso: string): string {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta", 
    }).format(new Date(iso));
}

function formatTime(time: string): string {
    return time.slice(0, 5); // "15:00:00" -> "15:00"
}

const KNOWN_STATUSES: ScheduleStatus[] = ["Available", "Almost Full", "Full"];

// Status tak dikenal dari backend dianggap "Available" supaya kartu tetap tampil rapi.
function normalizeStatus(status: string): ScheduleStatus {
    return KNOWN_STATUSES.includes(status as ScheduleStatus) ? (status as ScheduleStatus) : "Available";
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
        status: normalizeStatus(raw.status),
        coachName: raw.coach_name,
    };
}
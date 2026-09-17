const ACADEMY_API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type RawSchedule = {
    id: number;
    sport: { id: number | null; name: string | null };
    category: { id: number | null; name: string | null; age_range: string | null };
    class_name: string;
    branch: { id: number | null; name: string | null };
    venue: { id: number | null; name: string | null };
    date: string;
    start_time: string;
    end_time: string;
    quota: number;
    slots_taken: number;
    slots_remaining: number;
    status: string;
    coach_name: string | null;
};

export async function listPublicSchedules(): Promise<RawSchedule[]> {
    const res = await fetch(`${ACADEMY_API_URL}/public/schedules`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch schedules: ${res.status}`);
    }

    const json = await res.json();
    return json.data;
}
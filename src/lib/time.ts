import { addDays, startOfWeek, addWeeks as addWeeksFns, subMinutes } from 'date-fns';

const DAY_MAP: Record<string, number> = {
    'Sundays': 0, 'Mondays': 1, 'Tuesdays': 2, 'Wednesdays': 3, 'Thursdays': 4, 'Fridays': 5, 'Saturdays': 6
};

// Jikan returns 'Mondays', 'Tuesdays' etc for broadcast.day
export function getNextBroadcastDate(dayStr: string, timeStr: string, weekOffset: number = 0): Date | null {
    const dayIndex = DAY_MAP[dayStr];
    if (dayIndex === undefined) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const currentUTC = Date.now();
    const jstOffsetMs = 9 * 60 * 60 * 1000;
    const currentJST = currentUTC + jstOffsetMs;

    // Anchor to Start of THIS week (Sunday) in JST
    const dateJST = new Date(currentJST);
    const dayOfJST = dateJST.getUTCDay(); // UTC component of shifted date = JST day

    // ms since Sunday 00:00 JST
    const msSinceSunday =
        dayOfJST * 86400000 +
        dateJST.getUTCHours() * 3600000 +
        dateJST.getUTCMinutes() * 60000 +
        dateJST.getUTCSeconds() * 1000 +
        dateJST.getUTCMilliseconds();

    const startOfWeekJST_ms = currentJST - msSinceSunday;

    // Target Time in JST relative to start of THIS week
    // + weekOffset * 7 days
    let targetJST_ms = startOfWeekJST_ms +
        (dayIndex * 86400000) +
        (hours * 3600000) +
        (minutes * 60000);

    // Apply offset
    targetJST_ms += (weekOffset * 7 * 86400000);

    // Convert back to UTC (JST - 9h)
    const targetUTC_ms = targetJST_ms - jstOffsetMs;

    return new Date(targetUTC_ms);
}

export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function getLocalDayName(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

export function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday (Monday start)
    // Actually, let's stick to Sunday start effectively or whatever UI uses
    // UI uses Mon-Sun.
    // If today is Sunday (0), we want Start to be previous Monday? 
    // Let's use standard Mon-Sun week.
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
}

export function addWeeks(date: Date, numOptions: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + (numOptions * 7));
    return d;
}

export function formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

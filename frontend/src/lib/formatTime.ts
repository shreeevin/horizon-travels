import { format, parse } from 'date-fns';

export function formatTo12Hour(timeString: string): string {
    try {
        const parsed = parse(timeString, "HH:mm:ss", new Date());
        return format(parsed, "hh:mm a").toUpperCase();
    } catch (error) {
        return timeString;
    }
}

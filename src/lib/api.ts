// src/lib/api.ts
export interface Anime {
    mal_id: number;
    title: string;
    title_english: string | null;
    type: string | null;
    images: {
        webp: {
            image_url: string;
            large_image_url: string;
        };
    };
    broadcast: {
        day: string | null;
        time: string | null;
        timezone: string | null;
        string: string | null;
    };
    aired: {
        from: string | null;
        to: string | null;
        prop: {
            from: { day: number | null, month: number | null, year: number | null };
            to: { day: number | null, month: number | null, year: number | null };
        };
        string: string | null;
    };
    genres: { name: string }[];
    score: number | null;
    synopsis: string | null;
}

interface JikanResponse {
    data: Anime[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
    };
}

// Cache the schedule to avoid hitting API limit on every render if we were server-side properly,
// but for client-side demo we might just fetch.
export async function getWeeklySchedule(): Promise<Anime[]> {
    const allAnime: Anime[] = [];
    let page = 1;
    let hasNext = true;

    // Limit to 10 pages to ensure we catch all seasonal and continuing shows
    while (hasNext && page <= 10) {
        try {
            const res = await fetch(`https://api.jikan.moe/v4/schedules?page=${page}&sfw=true`);

            if (res.status === 429) {
                // Rate limited
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            if (!res.ok) break;

            const data: JikanResponse = await res.json();
            allAnime.push(...data.data);
            hasNext = data.pagination.has_next_page;
            page++;

            // Jikan rate limit: 3 requests per second.
            await new Promise(r => setTimeout(r, 350));
        } catch (error) {
            console.error("Fetch error:", error);
            break;
        }
    }

    // Filter out items with no broadcast time (some specials/OVAs might appear)
    return allAnime.filter(a => a.broadcast.day && a.broadcast.time);
}

export async function getCompletedAnime(): Promise<Anime[]> {
    try {
        // Fetch recently completed anime (sorted by end_date descending)
        // Jikan v4: status=complete, order_by=end_date, sort=desc
        const res = await fetch('https://api.jikan.moe/v4/anime?status=complete&order_by=end_date&sort=desc&page=1&limit=24&sfw=true');
        if (!res.ok) return [];
        const data: JikanResponse = await res.json();
        return data.data;
    } catch (error) {
        console.error("Fetch completed error:", error);
        return [];
    }
}

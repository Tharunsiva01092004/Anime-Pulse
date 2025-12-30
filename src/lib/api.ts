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
    const allAnimeMap = new Map<number, Anime>();

    const fetchEndpoint = async (url: string, maxPages: number = 3) => {
        let page = 1;
        let hasNext = true;
        while (hasNext && page <= maxPages) {
            try {
                const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}page=${page}&sfw=true`);
                if (res.status === 429) {
                    await new Promise(r => setTimeout(r, 1500)); // Be gentler on rate limit
                    continue;
                }
                if (!res.ok) break;
                const data: JikanResponse = await res.json();
                data.data.forEach(anime => {
                    // We store anything that has EITHER a broadcast schedule OR a set airing start date
                    // This catches upcoming premieres that don't have a standardized weekly slot yet.
                    if ((anime.broadcast.day && anime.broadcast.time) || anime.aired.from) {
                        allAnimeMap.set(anime.mal_id, anime);
                    }
                });
                hasNext = data.pagination.has_next_page;
                page++;
                await new Promise(r => setTimeout(r, 500));
            } catch (error) {
                console.error(`Fetch error for ${url}:`, error);
                break;
            }
        }
    };

    // 1. Fetch current week's schedule
    await fetchEndpoint('https://api.jikan.moe/v4/schedules', 6);

    // 2. Fetch current season's anime
    await fetchEndpoint('https://api.jikan.moe/v4/seasons/now', 4);

    // 3. Fetch Top Airing (best for trending/up-to-date shows)
    await fetchEndpoint('https://api.jikan.moe/v4/top/anime?filter=airing', 2);

    // 4. Fetch upcoming season (captures reveals/premieres starting very soon)
    await fetchEndpoint('https://api.jikan.moe/v4/seasons/upcoming', 2);

    return Array.from(allAnimeMap.values());
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

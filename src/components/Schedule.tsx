'use client';

import { Anime, getWeeklySchedule, getCompletedAnime } from '@/lib/api';
import { getLocalDayName, getNextBroadcastDate, formatDateShort, addWeeks, getStartOfWeek } from '@/lib/time';
import { useEffect, useState } from 'react';
import { AnimeCard } from './AnimeCard';
import { CompactCard } from './CompactCard';
import { CompletedCard } from './CompletedCard';
import { DayTabs } from './DayTabs';
import { Loader2, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import styles from './Schedule.module.css';
import weeklyStyles from './WeeklyView.module.css';

type ScheduleMap = Record<string, { anime: Anime; date: Date }[]>;
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduleProps {
    viewMode: 'grid' | 'weekly' | 'archive';
    searchTerm: string;
}

export function ScheduleComponent({ viewMode, searchTerm }: ScheduleProps) {
    const [schedule, setSchedule] = useState<ScheduleMap>({});
    const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<string>('Monday');
    const [mounted, setMounted] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);

    // Calculate dates for current week offset
    const currentWeekStart = addWeeks(getStartOfWeek(new Date()), weekOffset);

    // Derived Date Map for headers
    const getHeaderDate = (dayName: string) => {
        // Find index of day
        const dayIndex = DAYS_ORDER.indexOf(dayName); // Mon=0
        if (dayIndex === -1) return '';
        // Add days to Monday start
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + dayIndex);
        return formatDateShort(d);
    };

    useEffect(() => {
        setMounted(true);
        const today = getLocalDayName(new Date());
        setActiveDay(today);

        async function fetchData() {
            setLoading(true);
            const data = await getWeeklySchedule();
            const completed = await getCompletedAnime();

            const grouped: ScheduleMap = {
                'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []
            };

            data.forEach((anime) => {
                if (!anime.broadcast.day || !anime.broadcast.time) return;

                // Pass weekOffset to projection
                const broadcastDate = getNextBroadcastDate(anime.broadcast.day, anime.broadcast.time, weekOffset);

                if (broadcastDate) {
                    // Start/End validation
                    const fromDate = anime.aired.from ? new Date(anime.aired.from) : null;
                    const toDate = anime.aired.to ? new Date(anime.aired.to) : null;

                    // If broadcast date is BEFORE the start date, skip (future show not started yet)
                    // If broadcast date is AFTER the end date, skip (show ended)

                    // Be permissive if dates are missing, but generic schedule usually implies active shows.
                    if (fromDate && broadcastDate < fromDate) return;
                    // For end date, we check end of the broadcast day to be safe
                    if (toDate) {
                        const endOfBroadcastDay = new Date(broadcastDate);
                        endOfBroadcastDay.setHours(23, 59, 59, 999);
                        if (endOfBroadcastDay > toDate && endOfBroadcastDay.getTime() > toDate.getTime() + (86400000 * 2)) {
                            // Give a 2-day buffer for timezone differences and late data updates
                            // e.g. One Piece usually has null end date, but strict end dates can be tricky.
                            return;
                        }
                    }

                    const localDay = getLocalDayName(broadcastDate);
                    if (grouped[localDay]) {
                        grouped[localDay].push({ anime, date: broadcastDate });
                    }
                }
            });

            Object.keys(grouped).forEach(day => {
                grouped[day].sort((a, b) => a.date.getTime() - b.date.getTime());
            });

            setSchedule(grouped);
            setCompletedAnime(completed);
            setLoading(false);
        }

        fetchData();

        // Refresh interval (5 min)
        const interval = setInterval(() => {
            fetchData();
        }, 300000);

        return () => clearInterval(interval);
    }, [weekOffset]); // Re-run when week changes

    const handlePrevWeek = () => setWeekOffset(p => p - 1);
    const handleNextWeek = () => setWeekOffset(p => p + 1);

    if (!mounted || loading) {
        return (
            <div className={styles.loaderContainer}>
                <Loader2 className={styles.loader} size={48} />
            </div>
        );
    }

    // Filter Logic
    const filterAnime = (items: { anime: Anime; date: Date }[]) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.anime.title_english?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filterCompleted = (items: Anime[]) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.title_english?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <div className={styles.container}>
            {/* Week Navigation Controls */}
            {(viewMode === 'grid' || viewMode === 'weekly') && (
                <div className={styles.weekControls}>
                    <button onClick={handlePrevWeek} className={weeklyStyles.viewBtn}>
                        <ChevronLeft size={16} /> Prev Week
                    </button>
                    <span className={weeklyStyles.weekText}>
                        Week of {formatDateShort(currentWeekStart)}
                    </span>
                    <button onClick={handleNextWeek} className={weeklyStyles.viewBtn}>
                        Next Week <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {viewMode === 'grid' && (
                <>
                    <div className={styles.stickyHeader}>
                        <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
                    </div>

                    <div style={{ minHeight: '400px' }}>
                        {filterAnime(schedule[activeDay] || []).length === 0 ? (
                            <div className={styles.empty}>
                                No anime found for {activeDay}.
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {filterAnime(schedule[activeDay] || []).map((item) => (
                                    <AnimeCard
                                        key={item.anime.mal_id}
                                        anime={item.anime}
                                        broadcastDate={item.date}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {viewMode === 'weekly' && (
                <div className={weeklyStyles.weeklyContainer}>
                    <div className={weeklyStyles.weekGrid}>
                        {DAYS_ORDER.map(day => {
                            const items = filterAnime(schedule[day] || []);
                            const dateStr = getHeaderDate(day);

                            return (
                                <div key={day} className={weeklyStyles.dayColumn}>
                                    <div className={weeklyStyles.columnHeader}>
                                        <div className={weeklyStyles.dayTitle}>{day.substring(0, 3)}</div>
                                        <div className={weeklyStyles.dateSub}>{dateStr}</div>
                                    </div>
                                    {items.map(item => (
                                        <CompactCard
                                            key={item.anime.mal_id}
                                            anime={item.anime}
                                            broadcastDate={item.date}
                                        />
                                    ))}
                                    {items.length === 0 && (
                                        <div className={styles.empty} style={{ padding: '20px 0', fontSize: '0.8rem' }}>No Items</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {viewMode === 'archive' && (
                <div className={styles.grid}>
                    {filterCompleted(completedAnime).map((anime) => (
                        <CompletedCard
                            key={anime.mal_id}
                            anime={anime}
                        />
                    ))}
                    {filterCompleted(completedAnime).length === 0 && (
                        <div className={styles.empty} style={{ gridColumn: '1 / -1' }}>
                            No archive results found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

'use client';

import { Anime, getWeeklySchedule, getCompletedAnime } from '@/lib/api';
import { getLocalDayName, getNextBroadcastDate, formatDateShort, addWeeks, getStartOfWeek } from '@/lib/time';
import { useEffect, useState } from 'react';
import { AnimeCard } from './AnimeCard';
import { CompactCard } from './CompactCard';
import { CompletedCard } from './CompletedCard';
import { DayTabs } from './DayTabs';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Schedule.module.css';
import weeklyStyles from './WeeklyView.module.css';

type ScheduleMap = Record<string, { anime: Anime; date: Date }[]>;
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduleProps {
    viewMode: 'grid' | 'weekly' | 'archive' | 'premieres';
    searchTerm: string;
}

export function ScheduleComponent({ viewMode, searchTerm }: ScheduleProps) {
    const [schedule, setSchedule] = useState<ScheduleMap>({});
    const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
    const [premieres, setPremieres] = useState<{ anime: Anime; date: Date }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<string>('Monday');
    const [mounted, setMounted] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);
    const [premierePage, setPremierePage] = useState(0);

    // Calculate dates for current week offset
    const currentWeekStart = addWeeks(getStartOfWeek(new Date()), weekOffset);

    // Derived Date Map for headers
    const getHeaderDate = (dayName: string) => {
        const dayIndex = DAYS_ORDER.indexOf(dayName);
        if (dayIndex === -1) return '';
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + dayIndex);
        return formatDateShort(d);
    };

    useEffect(() => {
        setMounted(true);
        const todayAtMount = getLocalDayName(new Date());
        setActiveDay(todayAtMount);

        async function fetchData(silent = false) {
            if (!silent) setLoading(true);
            try {
                const data = await getWeeklySchedule();
                const completed = await getCompletedAnime();

                const grouped: ScheduleMap = {
                    'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []
                };

                const upcomingPremieres: { anime: Anime; date: Date }[] = [];
                const now = new Date();

                data.forEach((anime) => {
                    let broadcastDate: Date | null = null;
                    const startDate = anime.aired.from ? new Date(anime.aired.from) : null;

                    if (anime.broadcast.day && anime.broadcast.time) {
                        broadcastDate = getNextBroadcastDate(anime.broadcast.day, anime.broadcast.time, weekOffset);
                    } else if (startDate) {
                        const weekEnd = new Date(currentWeekStart);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        if (startDate >= currentWeekStart && startDate < weekEnd) {
                            broadcastDate = startDate;
                        }
                    }

                    if (broadcastDate) {
                        const fromDate = anime.aired.from ? new Date(anime.aired.from) : null;
                        const toDate = anime.aired.to ? new Date(anime.aired.to) : null;

                        if (fromDate && broadcastDate < fromDate) return;
                        if (toDate) {
                            const endOfBroadcastDay = new Date(broadcastDate);
                            endOfBroadcastDay.setHours(23, 59, 59, 999);
                            if (endOfBroadcastDay > toDate && endOfBroadcastDay.getTime() > toDate.getTime() + (86400000 * 2)) {
                                return;
                            }
                        }

                        const localDay = getLocalDayName(broadcastDate);
                        if (grouped[localDay]) {
                            grouped[localDay].push({ anime, date: broadcastDate });
                        }
                    }

                    if (startDate) {
                        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
                        if (startDate >= twoWeeksAgo) {
                            upcomingPremieres.push({ anime, date: startDate });
                        }
                    }
                });

                Object.keys(grouped).forEach(day => {
                    grouped[day].sort((a, b) => a.date.getTime() - b.date.getTime());
                });

                const uniquePremieres = Array.from(new Map(upcomingPremieres.map(p => [p.anime.mal_id, p])).values());
                uniquePremieres.sort((a, b) => a.date.getTime() - b.date.getTime());

                setSchedule(grouped);
                setCompletedAnime(completed);
                setPremieres(uniquePremieres);

                if (weekOffset === 0) {
                    const currentToday = getLocalDayName(new Date());
                    setActiveDay(prev => currentToday);
                }
            } catch (error) {
                console.error("Scale fetchData error:", error);
            } finally {
                if (!silent) setLoading(false);
            }
        }

        fetchData(false);

        const interval = setInterval(() => {
            fetchData(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [weekOffset]);

    const handlePrevWeek = () => {
        if (viewMode === 'premieres') {
            setPremierePage(p => Math.max(0, p - 1));
        } else {
            setWeekOffset(p => p - 1);
        }
    };

    const handleNextWeek = () => {
        if (viewMode === 'premieres') {
            setPremierePage(p => p + 1);
        } else {
            setWeekOffset(p => p + 1);
        }
    };

    if (!mounted || loading) {
        return (
            <div className={styles.loaderContainer}>
                <Loader2 className={styles.loader} size={48} />
            </div>
        );
    }

    const filterItems = <T extends { anime: Anime }>(items: T[]) => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(item =>
            item.anime.title.toLowerCase().includes(lower) ||
            item.anime.title_english?.toLowerCase().includes(lower)
        );
    };

    const filterCompleted = (items: Anime[]) => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(item =>
            item.title.toLowerCase().includes(lower) ||
            item.title_english?.toLowerCase().includes(lower)
        );
    };

    return (
        <div className={styles.container}>
            {(viewMode === 'grid' || viewMode === 'weekly' || viewMode === 'premieres') && (
                <div className={styles.weekControls}>
                    {viewMode === 'premieres' ? (
                        <div className={styles.simpleArrows}>
                            <button onClick={handlePrevWeek} className={styles.arrowBtn} disabled={premierePage === 0}>
                                <ChevronLeft size={24} />
                            </button>
                            <button onClick={handleNextWeek} className={styles.arrowBtn}>
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={handlePrevWeek} className={weeklyStyles.viewBtn}>
                                <ChevronLeft size={16} /> Prev Week
                            </button>
                            <span className={weeklyStyles.weekText}>
                                Week of {formatDateShort(currentWeekStart)}
                            </span>
                            <button onClick={handleNextWeek} className={weeklyStyles.viewBtn}>
                                Next Week <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            )}

            {viewMode === 'grid' && (
                <>
                    <div className={styles.stickyHeader}>
                        <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
                    </div>
                    <div style={{ minHeight: '400px' }}>
                        {filterItems(schedule[activeDay] || []).length === 0 ? (
                            <div className={styles.empty}>No anime found for {activeDay}.</div>
                        ) : (
                            <div className={styles.grid}>
                                {filterItems(schedule[activeDay] || []).map((item) => (
                                    <AnimeCard key={item.anime.mal_id} anime={item.anime} broadcastDate={item.date} />
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
                            const items = filterItems(schedule[day] || []);
                            const dateStr = getHeaderDate(day);
                            return (
                                <div key={day} className={weeklyStyles.dayColumn}>
                                    <div className={weeklyStyles.columnHeader}>
                                        <div className={weeklyStyles.dayTitle}>{day.substring(0, 3)}</div>
                                        <div className={weeklyStyles.dateSub}>{dateStr}</div>
                                    </div>
                                    {items.map(item => (
                                        <CompactCard key={item.anime.mal_id} anime={item.anime} broadcastDate={item.date} />
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

            {viewMode === 'premieres' && (
                <div className={weeklyStyles.weeklyContainer}>
                    <div className={weeklyStyles.weekGrid} style={{
                        gridTemplateColumns: `repeat(5, minmax(200px, 1fr))`,
                        minWidth: '1200px'
                    }}>
                        {(() => {
                            const groups: Record<string, { anime: Anime; date: Date }[]> = {};
                            filterItems(premieres.map(p => ({ anime: p.anime, date: p.date }))).forEach(p => {
                                const dateStr = p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                if (!groups[dateStr]) groups[dateStr] = [];
                                groups[dateStr].push(p);
                            });

                            const sortedDates = Object.keys(groups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                            if (sortedDates.length === 0) return <div className={styles.empty}>No upcoming premieres found.</div>;

                            const pageSize = 5;
                            const startIndex = premierePage * pageSize;
                            const pagedDates = sortedDates.slice(startIndex, startIndex + pageSize);

                            return pagedDates.map(dateStr => (
                                <div key={dateStr} className={weeklyStyles.dayColumn}>
                                    <div className={weeklyStyles.columnHeader}>
                                        <div className={weeklyStyles.dayTitle}>{dateStr}</div>
                                        <div className={weeklyStyles.dateSub}>Premiere Day</div>
                                    </div>
                                    {groups[dateStr].map(item => (
                                        <CompactCard key={item.anime.mal_id} anime={item.anime} broadcastDate={item.date} />
                                    ))}
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            )}

            {viewMode === 'archive' && (
                <div className={styles.grid}>
                    {filterCompleted(completedAnime).map((anime) => (
                        <CompletedCard key={anime.mal_id} anime={anime} />
                    ))}
                    {filterCompleted(completedAnime).length === 0 && (
                        <div className={styles.empty} style={{ gridColumn: '1 / -1' }}>No archive results found.</div>
                    )}
                </div>
            )}
        </div>
    );
}

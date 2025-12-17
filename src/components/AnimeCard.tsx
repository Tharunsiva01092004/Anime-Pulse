'use client';

import { Anime } from '@/lib/api';
import { formatTime } from '@/lib/time';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Tag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './AnimeCard.module.css';

interface AnimeCardProps {
    anime: Anime;
    broadcastDate: Date;
}

export function AnimeCard({ anime, broadcastDate }: AnimeCardProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [imgSrc, setImgSrc] = useState(anime.images.webp.large_image_url || anime.images.webp.image_url);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const diff = now.getTime() - broadcastDate.getTime();
            const duration = 25 * 60 * 1000; // Assume 25 min episode duration

            if (diff > duration) {
                setTimeLeft('Aired');
            } else if (diff >= 0 && diff <= duration) {
                setTimeLeft('Airing Now');
            } else {
                setTimeLeft(formatDistanceToNow(broadcastDate, { addSuffix: true }));
            }
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [broadcastDate]);

    return (
        <div className={styles.card}>
            {/* Image Container */}
            <div className={styles.imageContainer}>
                <Image
                    src={imgSrc}
                    alt={anime.title}
                    fill
                    className={styles.image}
                    onError={() => setImgSrc('https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/placeholder.png')} // Generic placeholder
                    unoptimized // Robustness: prevent next/image optimization errors with external domains if config is strict
                />
                <div className={styles.overlay} />

                {/* Time Badge */}
                <div className={styles.timeBadge}>
                    <Clock size={12} />
                    {formatTime(broadcastDate)}
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h3 className={styles.title}>
                    {anime.title_english || anime.title}
                </h3>

                <div className={styles.tags}>
                    {anime.genres.slice(0, 3).map((g) => (
                        <span key={g.name} className={styles.tag}>
                            <Tag size={10} /> {g.name}
                        </span>
                    ))}
                </div>

                <div className={styles.footer}>
                    <span className={styles.nextEp}>Next Ep</span>
                    <span className={
                        timeLeft === 'Aired' ? styles.countdown :
                            timeLeft === 'Airing Now' ? styles.airingNow :
                                styles.activeCountdown
                    }>
                        {timeLeft}
                    </span>
                </div>
            </div>
        </div>
    );
}

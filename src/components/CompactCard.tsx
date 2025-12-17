'use client';

import { Anime } from '@/lib/api';
import { formatTime } from '@/lib/time';
import styles from './WeeklyView.module.css';
import Image from 'next/image';
import { useState } from 'react';

interface CompactCardProps {
    anime: Anime;
    broadcastDate: Date;
}

export function CompactCard({ anime, broadcastDate }: CompactCardProps) {
    const [imgSrc, setImgSrc] = useState(anime.images.webp.image_url);

    return (
        <div className={styles.compactCard}>
            <div style={{ position: 'relative', width: '50px', height: '70px', flexShrink: 0 }}>
                <Image
                    src={imgSrc}
                    alt={anime.title}
                    fill
                    className={styles.compactImage}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    onError={() => setImgSrc('https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/placeholder.png')}
                    unoptimized
                />
            </div>
            <div className={styles.compactContent}>
                <span className={styles.time}>{formatTime(broadcastDate)}</span>
                <h4 className={styles.compactTitle} title={anime.title_english || anime.title}>
                    {anime.title_english || anime.title}
                </h4>
                <div className={styles.meta}>
                    <span className={styles.typeTag}>{anime.type || 'TV'}</span>
                    <span>(JP)</span>
                </div>
            </div>
        </div>
    );
}

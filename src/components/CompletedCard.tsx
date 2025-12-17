'use client';

import { Anime } from '@/lib/api';
import { Tag, Star, Layers } from 'lucide-react';
import Image from 'next/image';
import styles from './AnimeCard.module.css'; // Reusing general card styles for consistency

interface CompletedCardProps {
    anime: Anime;
}

export function CompletedCard({ anime }: CompletedCardProps) {
    // Reuse the .card logic but modify the footer content for "Completed" context

    return (
        <div className={styles.card}>
            {/* Image Container */}
            <div className={styles.imageContainer}>
                <Image
                    src={anime.images.webp.large_image_url || anime.images.webp.image_url}
                    alt={anime.title}
                    fill
                    className={styles.image}
                />
                <div className={styles.overlay} />

                {/* Score Badge instead of Time */}
                {anime.score && (
                    <div className={styles.timeBadge} style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                        <Star size={12} fill="#fbbf24" />
                        {anime.score}
                    </div>
                )}
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
                    <span className={styles.nextEp}>Status</span>
                    <span className={styles.countdown} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={12} />
                        Completed
                    </span>
                </div>
            </div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import styles from './DayTabs.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayTabsProps {
    activeDay: string;
    onSelect: (day: string) => void;
}

export function DayTabs({ activeDay, onSelect }: DayTabsProps) {
    return (
        <div className={styles.container}>
            {DAYS.map((day) => {
                const isActive = activeDay === day;
                return (
                    <button
                        key={day}
                        onClick={() => onSelect(day)}
                        className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className={styles.indicator}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className={styles.text}>{day.substring(0, 3)}</span>
                    </button>
                );
            })}
        </div>
    );
}

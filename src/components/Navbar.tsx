'use client';

import { Search, Bell, User, LayoutGrid, CalendarRange, Archive } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
    viewMode: 'grid' | 'weekly' | 'archive';
    setViewMode: (mode: 'grid' | 'weekly' | 'archive') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function Navbar({ viewMode, setViewMode, searchTerm, setSearchTerm }: NavbarProps) {
    return (
        <nav className={styles.navbar}>
            <a href="#" className={styles.logo}>
                ANIME PULSE
            </a>

            <div className={styles.navLinks}>
                <button
                    className={`${styles.navBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                >
                    Daily
                </button>
                <button
                    className={`${styles.navBtn} ${viewMode === 'weekly' ? styles.active : ''}`}
                    onClick={() => setViewMode('weekly')}
                >
                    Weekly
                </button>
                <button
                    className={`${styles.navBtn} ${viewMode === 'archive' ? styles.active : ''}`}
                    onClick={() => setViewMode('archive')}
                >
                    Archive
                </button>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.searchContainer}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Find anime..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className={styles.iconBtn}>
                    <Bell size={20} />
                </button>
                <button className={styles.iconBtn}>
                    <User size={20} />
                </button>
            </div>
        </nav>
    );
}

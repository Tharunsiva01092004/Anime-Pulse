'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { ScheduleComponent } from '@/components/Schedule';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'weekly' | 'archive'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <main className={styles.main}>
      <header className={styles.hero} style={{ minHeight: 'auto', paddingBottom: '0' }}>
        {/* We can keep a simplified hero or remove it if Navbar is sufficient. 
            For now, keeping the gradient background but removing the large title since Navbar has brand. */}
        <div className={styles.heroContent} style={{ display: 'none' }}>
          {/* Hiding old Hero Content to let Navbar take lead */}
        </div>
      </header>

      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className={styles.contentWrapper}>
        <ScheduleComponent
          viewMode={viewMode}
          searchTerm={searchTerm}
        />
      </div>
    </main>
  );
}

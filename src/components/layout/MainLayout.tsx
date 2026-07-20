import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const isUsersActive = pathname.startsWith('/users');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          {/* A simple placeholder icon */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
          </svg>
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>AdminPro</div>
          <div className={styles.brandSub}>Hệ thống quản trị</div>
        </div>
      </div>

      <nav className={styles.navGroup}>
        <div className={styles.navTitle}>TÀI KHOẢN</div>
        <Link href="#" className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          Thông tin tài khoản
        </Link>
      </nav>

      <nav className={styles.navGroup}>
        <div className={styles.navTitle}>QUẢN LÝ</div>
        <Link href="#" className={styles.navItem}>
          <span className={styles.navIcon}>🛡️</span>
          Nhóm quyền
        </Link>
        <Link href="/users" className={`${styles.navItem} ${isUsersActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>👥</span>
          Người dùng
        </Link>
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>AD</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>admin</div>
          <div className={styles.userRole}>Quản trị viên</div>
        </div>
      </div>
    </aside>
  );
}

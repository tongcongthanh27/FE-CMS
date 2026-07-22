'use client';

import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    
    if (token) {
      try {
        await fetch('/cms/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });
      } catch (err) {
        console.error('Lỗi khi gọi API đăng xuất:', err);
      }
    }
    
    // Xóa token khỏi Storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    
    // Chuyển hướng sang trang đăng nhập
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.rightSection}>
        <div className={styles.userInfo}>
          <span className={styles.statusDot}></span>
          Nguyễn Văn Admin
        </div>
        <div className={styles.divider}></div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}

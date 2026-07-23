'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Đang tải...');

  useEffect(() => {
    // Chỉ chạy trên client để lấy họ tên từ storage
    const storedFullName = localStorage.getItem('fullName') || sessionStorage.getItem('fullName');
    if (storedFullName) {
      setFullName(storedFullName);
    } else {
      setFullName('Người dùng');
    }
  }, []);

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
    
    // Xóa token và fullName khỏi Storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('fullName');
      sessionStorage.removeItem('fullName');
    }
    
    // Chuyển hướng sang trang đăng nhập
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.rightSection}>
        <div className={styles.userInfo}>
          <span className={styles.statusDot}></span>
          {fullName}
        </div>
        <div className={styles.divider}></div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}

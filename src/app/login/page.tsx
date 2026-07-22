'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/cms/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Server có thể trả về lỗi dạng JSON (vd 400, 404, 401)
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error('Lỗi phản hồi từ máy chủ.');
      }
      
      // Kiểm tra mã code trả về
      if (data.code !== undefined && data.code !== 1000 && data.code !== 0) {
        const code = Number(data.code);
        if (code === 1010) {
          throw new Error('Sai mật khẩu đăng nhập.');
        } else if (code === 1011) {
          throw new Error('Nhập sai mật khẩu quá giới hạn. Tài khoản đã bị khoá.');
        } else if (code === 1009) {
          throw new Error('Tài khoản đang bị khoá. Vui lòng liên hệ Admin.');
        } else if (code === 1005) {
          throw new Error('Tài khoản truy vấn không tồn tại.');
        }
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }

      // Store token (support both wrapped in result or direct)
      const token = data.result?.token || data.token;
      
      if (!token) {
        throw new Error('Không nhận được token từ máy chủ.');
      }

      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      // Redirect to admin dashboard or home
      router.push('/'); 
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div className={styles.headerTitle}>Hệ thống quản trị</div>
      </div>

      <div className={styles.card}>
        <h1 className={styles.cardTitle}>Đăng nhập</h1>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.actions}>
            <label className={styles.remember}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className={styles.forgot}>Quên mật khẩu?</a>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { userApi, UserCreationRequest } from '@/lib/api';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    accountType: 'Nội bộ',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: UserCreationRequest = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        dob: '1990-01-01', // API requires dob, setting a default for now
        phone: formData.phone,
      };
      
      const res = await userApi.createUser(payload);
      if (res.code === 0 || res.code === 1000) {
        router.push('/users'); // Redirect on success
      } else {
        setError(res.message || 'Thêm mới thất bại');
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'ApiError') {
        const code = err.code;
        if (code === 1002) setError('Tên đăng nhập đã tồn tại.');
        else if (code === 1003) setError('Tên đăng nhập phải chứa ít nhất 3 ký tự.');
        else if (code === 1004) setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
        else setError(err.message || 'Thêm mới thất bại');
      } else {
        setError(err.message || 'Đã xảy ra lỗi hệ thống');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/users" className={styles.backLink}>
        ← Quay lại
      </Link>
      
      <h1 className={styles.title}>Thêm mới người dùng</h1>

      <div className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Tên đăng nhập <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập" 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mật khẩu <span className={styles.required}>*</span></label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu" 
                required 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Họ và tên <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên" 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email <span className={styles.required}>*</span></label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email" 
                required 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại" 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Loại tài khoản <span className={styles.required}>*</span></label>
              <select name="accountType" value={formData.accountType} onChange={handleChange} required>
                <option value="Nội bộ">Nội bộ</option>
                <option value="Khách">Khách</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Nhóm quyền <span className={styles.required}>*</span></label>
            <input 
              type="text" 
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Chọn nhóm quyền..." 
              required 
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => router.push('/users')} className={styles.btnCancel}>Hủy</button>
            <button type="submit" disabled={loading} className={styles.btnSubmit}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

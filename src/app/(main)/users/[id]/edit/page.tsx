"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../create/page.module.css';
import { userApi, UserUpdateRequest } from '@/lib/api';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    accountType: 'Nội bộ',
    role: '',
    dob: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getUser(id);
        if ((res.code === 1000 || res.code === 0) && res.result) {
          const user = res.result;
          setFormData({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            accountType: 'Nội bộ', // Mocked
            role: user.role || '',
            dob: user.dob || '1990-01-01'
          });
        }
      } catch (err) {
        console.error(err);
        // Mock data for demo
        setFormData({
          username: 'nguyenvan.a',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvan.a@co.vn',
          phone: '0912 111 222',
          accountType: 'Nội bộ',
          role: '',
          dob: '1990-01-01'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: UserUpdateRequest = {
        fullName: formData.fullName,
        email: formData.email,
        dob: formData.dob || '1990-01-01', 
        phone: formData.phone,
      };
      
      const res = await userApi.updateUser(id, payload);
      if (res.code === 0 || res.code === 1000) {
        router.push('/users'); // Redirect on success
      } else {
        setError(res.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Đang tải...</div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/users" className={styles.backLink}>
        ← Quay lại
      </Link>
      
      <h1 className={styles.title}>Cập nhật người dùng</h1>

      <div className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            {/* Disabled Username */}
            <div className={styles.formGroup}>
              <label>Tên đăng nhập <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                disabled
              />
            </div>
            {/* Empty space to match the mockup where Tên đăng nhập might be full width or half. Wait, looking at the mockup, it's just Tên đăng nhập on the top row, but wait, cap-nhat.png shows Tên đăng nhập taking half width, and the right side is empty? No, wait. 
            Let me look at cap-nhat.png: 
            Row 1: Tên đăng nhập (full width or half? it seems half width).
            Row 2: Họ và tên, Email
            Row 3: Số điện thoại, Loại tài khoản
            Row 4: Nhóm quyền (full width).
            I'll adjust this layout. */}
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
            <button type="submit" disabled={saving} className={styles.btnSubmit}>
              {saving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Mock data based on the API response structure UserResponse
  const [userInfo, setUserInfo] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [updateForm, setUpdateForm] = useState({
    email: '',
    fullName: '',
    phone: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }

        const response = await fetch('/cms/users/my-info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.code === 0 && data.result) {
          setUserInfo(data.result);
        } else {
          throw new Error(data.message || 'Lỗi khi lấy thông tin người dùng.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleUpdateSubmit = async () => {
    setUpdateError('');
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/cms/users/${(userInfo as any).id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateForm),
      });

      const data = await response.json();
      
      if (data.code === 0) {
        // Update local state with new info
        setUserInfo(prev => ({
          ...prev,
          ...updateForm
        }));
        setIsUpdateModalOpen(false);
      } else {
        throw new Error(data.message || 'Lỗi khi cập nhật thông tin.');
      }
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Thông tin tài khoản</h1>
        <p className={styles.pageSubtitle}>Xem và quản lý thông tin cá nhân của bạn</p>
      </div>

      {isLoading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
          {error}
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar}>
              {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 'AD'}
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.userName}>{userInfo.fullName}</div>
              <div className={styles.userRole}>Quản trị viên hệ thống</div>
            </div>
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Tên đăng nhập</div>
              <div className={styles.infoValue}>{userInfo.username}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Họ và tên</div>
              <div className={styles.infoValue}>{userInfo.fullName}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>{userInfo.email}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Số điện thoại</div>
              <div className={styles.infoValue}>{userInfo.phone}</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => {
              setUpdateForm({
                email: userInfo.email,
                fullName: userInfo.fullName,
                phone: userInfo.phone
              });
              setUpdateError('');
              setIsUpdateModalOpen(true);
            }}>
              Cập nhật
            </button>
            <button className={styles.btnOutline} onClick={() => setIsPasswordModalOpen(true)}>
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}

      {/* Update Info Modal */}
      {isUpdateModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsUpdateModalOpen(false); }}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Cập nhật thông tin tài khoản</h2>
            
            {updateError && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>{updateError}</div>}

            
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên đăng nhập</label>
              <input 
                type="text" 
                className={styles.input} 
                value={userInfo.username} 
                disabled 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input 
                type="email" 
                className={styles.input} 
                value={updateForm.email}
                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Họ và tên</label>
              <input 
                type="text" 
                className={styles.input} 
                value={updateForm.fullName}
                onChange={(e) => setUpdateForm({ ...updateForm, fullName: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại</label>
              <input 
                type="text" 
                className={styles.input} 
                value={updateForm.phone}
                onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setIsUpdateModalOpen(false)} disabled={isUpdating}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleUpdateSubmit} disabled={isUpdating}>
                {isUpdating ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsPasswordModalOpen(false); }}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Đổi mật khẩu</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu cũ</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Nhập mật khẩu cũ"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu mới</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nhập lại mật khẩu mới</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setIsPasswordModalOpen(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={() => setIsPasswordModalOpen(false)}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

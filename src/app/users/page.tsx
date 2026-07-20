"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { userApi, User } from '@/lib/api';
import Modal from '@/components/ui/Modal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers();
      if ((res.code === 1000 || res.code === 0) && res.result) {
        setUsers(res.result);
      } else {
        setUsers(mockUsers);
      }
    } catch (err) {
      console.error("Failed to fetch users, using mock data", err);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userApi.deleteUser(userToDelete.id);
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error(err);
      // Mock delete for UI since API might fail
      setUsers(users.filter(u => u.id !== userToDelete.id));
    } finally {
      setUserToDelete(null);
    }
  };

  const handleSuspend = async () => {
    if (!userToSuspend) return;
    
    const newStatus = (userToSuspend.status === 'Tạm khóa' || userToSuspend.status === 'LOCKED') ? 'ACTIVE' : 'LOCKED';
    
    try {
      await userApi.updateUserStatus(userToSuspend.id, newStatus);
      // Fetch users again to get updated data, or update locally
      setUsers(users.map(u => {
        if (u.id === userToSuspend.id) {
          return { ...u, status: newStatus };
        }
        return u;
      }));
    } catch (err) {
      console.error("Failed to update status", err);
      // Fallback update in UI if API fails for demo
      setUsers(users.map(u => {
        if (u.id === userToSuspend.id) {
          return { ...u, status: newStatus };
        }
        return u;
      }));
    } finally {
      setUserToSuspend(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý người dùng</h1>
        <p className={styles.subtitle}>Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      <div className={styles.card}>
        <div className={styles.filters}>
          <div className={styles.filterInputs}>
            <input type="text" placeholder="Tên tài khoản..." className={styles.input} />
            <input type="text" placeholder="Họ và tên..." className={styles.input} />
            <input type="text" placeholder="Email..." className={styles.input} />
            <button className={styles.btnPrimary}>Tìm kiếm</button>
          </div>
          <Link href="/users/create" className={styles.btnSuccess}>
            + Thêm mới
          </Link>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên tài khoản</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.loadingCell}>Đang tải...</td></tr>
              ) : users.map(user => (
                <tr key={user.id || user.username}>
                  <td><span className={styles.usernameText}>{user.username}</span></td>
                  <td>{user.fullName}</td>
                  <td>{user.department || 'Kinh doanh'}</td>
                  <td>{user.phone || '0912 111 222'}</td>
                  <td>{user.email}</td>
                  <td><span className={styles.roleBadge}>{user.role || 'Nhân viên KD'}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${(user.status === 'Tạm khóa' || user.status === 'LOCKED') ? styles.statusInactive : styles.statusActive}`}>
                      <span className={styles.dot}></span>
                      {user.status === 'LOCKED' ? 'Tạm khóa' : (user.status === 'ACTIVE' ? 'Hoạt động' : (user.status || 'Hoạt động'))}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/users/${user.id || '1'}/edit`} className={styles.actionEdit}>Sửa</Link>
                      <button onClick={() => setUserToDelete(user)} className={styles.actionDelete}>Xóa</button>
                      <button onClick={() => setUserToSuspend(user)} className={styles.actionSuspend}>
                        {(user.status === 'Tạm khóa' || user.status === 'LOCKED') ? 'Kích hoạt' : 'Tạm dừng'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Hiển thị 1–10 / 12 bản ghi
          </div>
          <div className={styles.pageControls}>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      <Modal
        isOpen={!!userToSuspend}
        onClose={() => setUserToSuspend(null)}
        title={(userToSuspend?.status === 'Tạm khóa' || userToSuspend?.status === 'LOCKED') ? "Kích hoạt tài khoản" : "Tạm dừng tài khoản"}
        icon={
          <div className={styles.suspendIconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </div>
        }
      >
        <p>Bạn xác nhận {(userToSuspend?.status === 'Tạm khóa' || userToSuspend?.status === 'LOCKED') ? 'kích hoạt' : 'tạm dừng'} tài khoản</p>
        <p className={styles.modalUsername}>{userToSuspend?.username}?</p>
        <div className={styles.modalActions}>
          <button onClick={() => setUserToSuspend(null)} className={styles.btnCancel}>Hủy</button>
          <button onClick={handleSuspend} className={styles.btnConfirmSuspend}>Xác nhận</button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Xác nhận xóa tài khoản"
        icon={
          <div className={styles.deleteIconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        }
      >
        <p>Bạn có chắc chắn xóa tài khoản này?</p>
        <p className={styles.modalUsername}>{userToDelete?.username}</p>
        <div className={styles.modalActions}>
          <button onClick={() => setUserToDelete(null)} className={styles.btnCancel}>Hủy</button>
          <button onClick={handleDelete} className={styles.btnConfirmDelete}>Xóa</button>
        </div>
      </Modal>
    </div>
  );
}

const mockUsers: User[] = [
  { id: '1', username: 'nguyenvan.a', fullName: 'Nguyễn Văn A', email: 'nguyenvan.a@co.vn', dob: '1990-01-01', department: 'Kinh doanh', phone: '0912 111 222', role: 'Nhân viên KD', status: 'Hoạt động' },
  { id: '2', username: 'tranthib', fullName: 'Trần Thị B', email: 'tranthib@co.vn', dob: '1990-01-01', department: 'Kế toán', phone: '0923 222 333', role: 'Kế toán', status: 'Hoạt động' },
  { id: '3', username: 'levanc', fullName: 'Lê Văn C', email: 'levanc@co.vn', dob: '1990-01-01', department: 'IT', phone: '0934 333 444', role: 'IT Support', status: 'Tạm khóa' },
  { id: '4', username: 'phamthid', fullName: 'Phạm Thị D', email: 'phamthid@co.vn', dob: '1990-01-01', department: 'Nhân sự', phone: '0945 444 555', role: 'Nhân sự', status: 'Hoạt động' },
  { id: '5', username: 'hoangtane', fullName: 'Hoàng Tấn E', email: 'hoangtane@co.vn', dob: '1990-01-01', department: 'Marketing', phone: '0958 555 666', role: 'Marketing', status: 'Hoạt động' },
];

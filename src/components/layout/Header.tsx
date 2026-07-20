import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.rightSection}>
        <div className={styles.userInfo}>
          <span className={styles.statusDot}></span>
          Nguyễn Văn Admin
        </div>
        <div className={styles.divider}></div>
        <button className={styles.logoutBtn}>Đăng xuất</button>
      </div>
    </header>
  );
}

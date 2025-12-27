'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Home.module.css';

export default function HomePage() {
  const router = useRouter();
  const [time, setTime] = useState('16:17');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    // Update clock
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleIconClick = (appName: string, event: React.MouseEvent) => {
    const timerKey = `timer_${appName}`;
    const existingTimer = (window as any)[timerKey];

    if (existingTimer) {
      // Double click
      clearTimeout(existingTimer);
      delete (window as any)[timerKey];
      setSelectedIcon(null);
      
      if (appName === 'box') {
        router.push('/box');
      } else {
        alert(`正在打开 ${appName}...`);
      }
    } else {
      // First click - set timer for single click
      (window as any)[timerKey] = setTimeout(() => {
        delete (window as any)[timerKey];
        setSelectedIcon(appName);
      }, 300);
    }
  };

  const handleLogin = () => {
    router.push('/');
  };

  return (
    <div className={styles.body}>
      <div className={styles.desktopIcons}>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'my-computer' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('my-computer', e)}
          >
            <div className={styles.iconImage}>💻</div>
            <div className={styles.iconLabel}>我的電腦</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'paint' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('paint', e)}
          >
            <div className={styles.iconImage}>🖌️</div>
            <div className={styles.iconLabel}>小畫家</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'recycle-bin' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('recycle-bin', e)}
          >
            <div className={styles.iconImage}>🗑️</div>
            <div className={styles.iconLabel}>垃圾桶</div>
          </div>
        </div>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'ipod' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('ipod', e)}
          >
            <div className={styles.iconImage}>🎵</div>
            <div className={styles.iconLabel}>iPod</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'sound-board' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('sound-board', e)}
          >
            <div className={styles.iconImage}>💿</div>
            <div className={styles.iconLabel}>音效板</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'chat' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('chat', e)}
          >
            <div className={styles.iconImage}>💬</div>
            <div className={styles.iconLabel}>聊天</div>
          </div>
        </div>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'minesweeper' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('minesweeper', e)}
          >
            <div className={styles.iconImage}>💣</div>
            <div className={styles.iconLabel}>踩地雷</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'applet-store' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('applet-store', e)}
          >
            <div className={styles.iconImage}>🪟</div>
            <div className={styles.iconLabel}>小程式商店</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'synthesizer' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('synthesizer', e)}
          >
            <div className={styles.iconImage}>🎹</div>
            <div className={styles.iconLabel}>合成器</div>
          </div>
        </div>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'internet-explorer' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('internet-explorer', e)}
          >
            <div className={styles.iconImage}>🌐</div>
            <div className={styles.iconLabel}>Internet Explorer</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'terminal' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('terminal', e)}
          >
            <div className={styles.iconImage}>💻</div>
            <div className={styles.iconLabel}>終端機</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'text-editor' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('text-editor', e)}
          >
            <div className={styles.iconImage}>📝</div>
            <div className={styles.iconLabel}>文字編輯</div>
          </div>
        </div>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'virtual-pc' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('virtual-pc', e)}
          >
            <div className={styles.iconImage}>🖥️</div>
            <div className={styles.iconLabel}>虛擬 PC</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'photo-booth' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('photo-booth', e)}
          >
            <div className={styles.iconImage}>📷</div>
            <div className={styles.iconLabel}>照片亭</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'administrator' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('administrator', e)}
          >
            <div className={styles.iconImage}>⚙️</div>
            <div className={styles.iconLabel}>管理員</div>
          </div>
        </div>
        <div className={styles.iconRow}>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'video' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('video', e)}
          >
            <div className={styles.iconImage}>🎬</div>
            <div className={styles.iconLabel}>影片</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'karaoke' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('karaoke', e)}
          >
            <div className={styles.iconImage}>🎤</div>
            <div className={styles.iconLabel}>卡拉OK</div>
          </div>
          <div 
            className={`${styles.desktopIcon} ${selectedIcon === 'box' ? styles.selected : ''}`}
            onClick={(e) => handleIconClick('box', e)}
          >
            <div className={styles.iconImage}>📦</div>
            <div className={styles.iconLabel}>3D 盒子</div>
          </div>
        </div>
      </div>

      <div className={styles.taskbar}>
        <button className={styles.startButton} onClick={() => alert('开始菜单')}>
          <div className={styles.windowsLogo}>
            <div className={`${styles.windowsLogoSquare} ${styles.red}`}></div>
            <div className={`${styles.windowsLogoSquare} ${styles.green}`}></div>
            <div className={`${styles.windowsLogoSquare} ${styles.blue}`}></div>
            <div className={`${styles.windowsLogoSquare} ${styles.yellow}`}></div>
          </div>
          开始
        </button>
        <button className={styles.loginButton} onClick={handleLogin}>
          登录
        </button>
        <div className={styles.taskbarRight}>
          <div className={styles.taskbarIcon}>🔊</div>
          <div className={styles.clock}>{time}</div>
        </div>
      </div>
    </div>
  );
}


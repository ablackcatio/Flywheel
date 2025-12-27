'use client';

import { useEffect, useRef } from 'react';

export default function Box3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return;

    const container = containerRef.current;
    
    // 确保容器有正确的id（app.js会查找id="container"的元素）
    container.id = 'container';

    // 添加importmap（必须在加载app.js之前）
    let importMapScript = document.querySelector('script[type="importmap"]') as HTMLScriptElement;
    if (!importMapScript) {
      importMapScript = document.createElement('script');
      importMapScript.type = 'importmap';
      importMapScript.textContent = JSON.stringify({
        imports: {
          "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
      });
      document.head.appendChild(importMapScript);
    }

    // 等待importmap加载完成后再加载app.js
    // 使用setTimeout确保importmap已被浏览器处理
    const loadAppJs = () => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/app.js';
      
      script.onload = () => {
        console.log('app.js loaded successfully');
      };

      script.onerror = (error) => {
        console.error('Failed to load app.js:', error);
      };

      document.body.appendChild(script);
      scriptLoadedRef.current = true;
    };

    // 稍微延迟加载，确保importmap已处理
    const timer = setTimeout(loadAppJs, 100);

    return () => {
      clearTimeout(timer);
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      id="container"
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    />
  );
}

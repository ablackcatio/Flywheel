'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    city: '',
    mbti: ''
  });

  // Three.js scene setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0d1a, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0xff6b6b);
    const color2 = new THREE.Color(0x4facfe);

    for(let i = 0; i < particlesCount * 3; i += 3) {
      const r = 10 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i+2] = r * Math.cos(phi);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colorsArray[i] = mixedColor.r;
      colorsArray[i+1] = mixedColor.g;
      colorsArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;

      particlesMesh.rotation.y += 0.002;
      particlesMesh.rotation.x += (targetY - particlesMesh.rotation.x) * 0.05;
      particlesMesh.rotation.z += (targetX - particlesMesh.rotation.z) * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Zoom effect when form shows
    if (showForm) {
      const duration = 1000;
      const startZoom = camera.position.z;
      const endZoom = 3;
      const startTime = Date.now();

      const zoom = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        
        camera.position.z = startZoom + (endZoom - startZoom) * ease;
        
        if (progress < 1) {
          requestAnimationFrame(zoom);
        }
      };
      zoom();
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [showForm]);

  // Update progress
  useEffect(() => {
    const filledCount = Object.values(formData).filter(v => v.trim() !== '').length;
    const percentage = Math.round((filledCount / 4) * 100);
    setProgress(percentage);
  }, [formData]);

  const handleStart = () => {
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 生成userId（如果还没有）
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userInfo = {
      userId: userId, // 确保包含userId
      nickname: formData.nickname,
      age: formData.age,
      city: formData.city,
      mbti: formData.mbti,
      createdAt: new Date().toISOString(),
    };

    // Store user info
    if (typeof window !== 'undefined') {
      localStorage.setItem('flywheel_user', JSON.stringify(userInfo));
      console.log('✅ 用户信息已保存到localStorage:', userInfo);
    }

    // Redirect to home page
    router.push('/home');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentDate = new Date();
  const dateText = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0d0d1a' }}>
      {/* Canvas container */}
      <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* UI container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        pointerEvents: 'none'
      }}>
        {!showForm && (
          <button
            onClick={handleStart}
            style={{
              padding: '8px 24px',
              fontSize: '14px',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ffffff #000000 #000000 #ffffff',
              color: 'black',
              cursor: 'pointer',
              boxShadow: '1px 1px 0 0 black',
              pointerEvents: 'auto',
              fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif"
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
              e.currentTarget.style.transform = 'translate(1px, 1px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '1px 1px 0 0 black';
            }}
          >
            开启"她的多重宇宙"
          </button>
        )}

        {showForm && (
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: '1px 1px 0 0 black',
            padding: '2px',
            display: 'flex',
            flexDirection: 'column',
            width: '400px',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              padding: '3px 4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2px'
            }}>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>@box</span>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button style={{ width: '16px', height: '14px', background: '#c0c0c0', border: '1px solid', borderColor: '#ffffff #000000 #000000 #ffffff', fontSize: '9px', padding: 0, fontWeight: 'bold' }}>_</button>
                <button style={{ width: '16px', height: '14px', background: '#c0c0c0', border: '1px solid', borderColor: '#ffffff #000000 #000000 #ffffff', fontSize: '9px', padding: 0, fontWeight: 'bold' }}>□</button>
                <button style={{ width: '16px', height: '14px', background: '#c0c0c0', border: '1px solid', borderColor: '#ffffff #000000 #000000 #ffffff', fontSize: '9px', padding: 0, fontWeight: 'bold' }}>×</button>
              </div>
            </div>

            <div style={{ padding: '2px 0 4px 6px', fontSize: '11px', color: 'black', display: 'flex', gap: '12px' }}>
              <span style={{ textDecoration: 'underline', cursor: 'default' }}>文件</span>
              <span style={{ textDecoration: 'underline', cursor: 'default' }}>聊天</span>
              <span style={{ textDecoration: 'underline', cursor: 'default' }}>声音</span>
              <span style={{ textDecoration: 'underline', cursor: 'default' }}>查看</span>
              <span style={{ textDecoration: 'underline', cursor: 'default' }}>帮助</span>
            </div>

            <div style={{ padding: '10px', border: '1px solid transparent' }}>
              <div style={{ display: 'flex', height: '350px', gap: 0, marginBottom: '10px' }}>
                <div style={{ flex: 1, background: 'white', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '10px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '11px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>@box ▼</span>
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '10px', color: '#666' }}>
                    📅 box {dateText}
                  </div>

                  <div style={{ background: '#e8f4f8', padding: '8px', border: '1px solid black', fontSize: '11px', marginBottom: '10px' }}>
                    👋 我是box, 请完善您的信息以便进入宇宙!
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid black', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'black', fontWeight: 'normal' }}>昵称</label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        required
                        autoComplete="off"
                        style={{
                          padding: '4px',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: 'white',
                          color: 'black',
                          outline: 'none',
                          fontSize: '11px',
                          borderRadius: 0,
                          fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif",
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'black', fontWeight: 'normal' }}>年龄</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        required
                        min={1}
                        max={120}
                        style={{
                          padding: '4px',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: 'white',
                          color: 'black',
                          outline: 'none',
                          fontSize: '11px',
                          borderRadius: 0,
                          fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif",
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'black', fontWeight: 'normal' }}>城市</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        autoComplete="off"
                        style={{
                          padding: '4px',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: 'white',
                          color: 'black',
                          outline: 'none',
                          fontSize: '11px',
                          borderRadius: 0,
                          fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif",
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'black', fontWeight: 'normal' }}>MBTI</label>
                      <input
                        type="text"
                        value={formData.mbti}
                        onChange={(e) => handleInputChange('mbti', e.target.value)}
                        placeholder="例如: INFP"
                        required
                        autoComplete="off"
                        style={{
                          padding: '4px',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: 'white',
                          color: 'black',
                          outline: 'none',
                          fontSize: '11px',
                          borderRadius: 0,
                          fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif",
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        marginTop: '10px',
                        padding: '6px 20px',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        color: 'black',
                        fontWeight: 'normal',
                        fontSize: '11px',
                        cursor: 'pointer',
                        alignSelf: 'flex-end',
                        boxShadow: '1px 1px 0 0 black',
                        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', sans-serif"
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
                        e.currentTarget.style.transform = 'translate(1px, 1px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '1px 1px 0 0 black';
                      }}
                    >
                      确定
                    </button>
                  </form>
                </div>
              </div>

              <div style={{
                marginTop: '4px',
                border: '1px solid',
                borderColor: '#808080 #ffffff #ffffff #808080',
                padding: 0,
                height: '20px',
                position: 'relative',
                background: '#c0c0c0'
              }}>
                <div style={{
                  height: '100%',
                  background: '#000080',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '4px',
                  fontSize: '11px',
                  color: 'white',
                  zIndex: 2,
                  mixBlendMode: 'difference'
                }}>
                  {progress === 100 ? '就绪' : `正在输入... ${progress}%`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 场景、相机、渲染器设置
let scene, camera, renderer, controls;
let cubes = [];
let cubeMap = {};
let wireframeMode = false;
let raycaster, mouse;

// 照片相关
let photos = [];
let photoGroup = new THREE.Group();
let isBoxOpened = false;
let selectedPhoto = null;
let photosAnimating = false;

// 粒子系统
let particles = [];
let particleGroup = new THREE.Group();

// 照片数据（9张照片，使用占位图片）
const photoCount = 9;
const photoUrls = [];
for (let i = 1; i <= photoCount; i++) {
    photoUrls.push(`https://via.placeholder.com/${400 + Math.random() * 200}x${400 + Math.random() * 200}/FF6B6B/FFFFFF?text=B2-2-${i}`);
}

// 初始化
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f0a); // 温暖的深色背景（带一点棕色调，更温馨）
    
    // 创建相机（初始视角：侧视图，微微看到盒子顶端）
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // 侧视图：从侧面稍微倾斜的角度，可以看到盒子顶端（B2-2在底部中心y=-8）
    camera.position.set(15, -2, 15); // 从侧面和稍微向下的角度
    camera.lookAt(0, -8, 0); // 看向盒子位置（B2-2在y=-8）
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 设置鼠标样式
    renderer.domElement.style.cursor = 'pointer';
    
    // 轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    
    // 添加光源（圣诞氛围，温暖的家庭氛围灯光）
    // 温暖的暖白色环境光（模拟室内灯光）
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.6); // 暖白色
    scene.add(ambientLight);
    
    // 主光源在左半侧（温暖的烛光色）
    const directionalLight1 = new THREE.DirectionalLight(0xfff0d0, 1.3); // 温暖的暖黄色
    directionalLight1.position.set(-15, 10, 5); // 左侧光源
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    // 辅助光源（温暖的暖白色）
    const directionalLight2 = new THREE.DirectionalLight(0xfff8e1, 0.5); // 温暖的暖白色
    directionalLight2.position.set(5, 5, -5);
    scene.add(directionalLight2);
    
    // 添加点光源（增强反光效果，圣诞氛围，温暖的家庭氛围灯光）
    // 增大光源距离以产生更大的高光区域
    const pointLight1 = new THREE.PointLight(0xfff0d0, 4.5, 100); // 温暖的暖黄色点光源（模拟烛光）
    pointLight1.position.set(-10, 8, 8);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffd700, 4.0, 100); // 金色点光源（圣诞装饰灯）
    pointLight2.position.set(10, 5, -8);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xff6b47, 3.5, 100); // 温暖的红色点光源（圣诞红）
    pointLight3.position.set(0, 12, 0);
    scene.add(pointLight3);
    
    const pointLight4 = new THREE.PointLight(0x90ee90, 3.5, 100); // 柔和的绿色点光源（圣诞绿）
    pointLight4.position.set(-8, -5, 8);
    scene.add(pointLight4);
    
    // 额外的温暖光源（增加圣诞氛围）
    const pointLight5 = new THREE.PointLight(0xffa500, 3.0, 100); // 温暖的橙色点光源
    pointLight5.position.set(8, -3, -10);
    scene.add(pointLight5);
    
    const pointLight6 = new THREE.PointLight(0xfff4e6, 2.5, 100); // 柔和的暖白色点光源
    pointLight6.position.set(-5, -8, 5);
    scene.add(pointLight6);
    
    // 初始化射线投射器
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // 添加照片组和粒子组到场景
    scene.add(photoGroup);
    scene.add(particleGroup);
    
    // 创建立方体
    createCubes();
    
    // 添加鼠标事件
    renderer.domElement.addEventListener('click', onMouseClick, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    
    // 处理窗口大小调整
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始渲染循环
    animate();
}

// 根据图片中的布局创建立方体
function createCubes() {
    const cubeSize = 1;
    const spacing = 2.5;
    const baseOffset = -spacing;
    const baseYOffset = -spacing;
    
    const layers = ['C', 'B', 'A'];
    const rows = ['1', '2', '3'];
    const cols = ['1', '2', '3'];
    
    const material = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.1,
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    
    for (let layerIndex = 0; layerIndex < 3; layerIndex++) {
        const layer = layers[layerIndex];
        const z = 2 - layerIndex;
        
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            const row = rows[rowIndex];
            const y = 2 - rowIndex;
            
            for (let colIndex = 0; colIndex < 3; colIndex++) {
                const col = cols[colIndex];
                const x = colIndex;
                
                const label = `${layer}${row}-${col}`;
                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                const cube = new THREE.Mesh(geometry, material);
                
                const posX = x * spacing + baseOffset;
                const posY = y * spacing + baseYOffset;
                const posZ = z * spacing + baseOffset;
                
                cube.position.set(posX, posY, posZ);
                cube.castShadow = true;
                cube.receiveShadow = true;
                
                cube.userData.label = label;
                cube.userData.size = 'large';
                cube.userData.layerIndex = layerIndex;
                cube.userData.rowIndex = rowIndex;
                cube.userData.colIndex = colIndex;
                
                scene.add(cube);
                cubes.push(cube);
                cubeMap[label] = cube;
                
                createLabel(cube, label);
                
                // 隐藏所有盒子，除了B2-2
                if (label !== 'B2-2') {
                    cube.visible = false;
                    if (cube.userData.labelSprite) {
                        cube.userData.labelSprite.visible = false;
                    }
                }
            }
        }
    }
    
    // 将B2-2盒子移动到红色画框位置（底部中心，远离照片）
    const b2_2Cube = cubeMap['B2-2'];
    let b2_2OriginalPosition = null;
    if (b2_2Cube) {
        // 保存B2-2的原始位置
        b2_2OriginalPosition = b2_2Cube.position.clone();
        // 红色画框位置：底部中心（y = -8）
        const framePosition = new THREE.Vector3(0, -8, 0);
        b2_2Cube.position.copy(framePosition);
        // 更新标签位置
        if (b2_2Cube.userData.labelSprite) {
            b2_2Cube.userData.labelSprite.position.copy(framePosition);
            b2_2Cube.userData.labelSprite.position.y += 0.7;
        }
    }
    
    // 计算需要下移的距离（让群组中的B2-2与底部独立的B2-2重合）
    if (b2_2OriginalPosition && b2_2Cube) {
        const targetPosition = new THREE.Vector3(0, -8, 0);
        const offsetY = targetPosition.y - b2_2OriginalPosition.y;
        
        // 将除了B2-2之外的所有盒子下移
        cubes.forEach(cube => {
            if (cube.userData.label !== 'B2-2') {
                cube.position.y += offsetY;
                // 同时更新标签位置
                if (cube.userData.labelSprite) {
                    cube.userData.labelSprite.position.y += offsetY;
                }
            }
        });
    }
}

// 创建文字标签
function createLabel(cube, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = 'bold 42px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.1
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const labelSize = cube.userData.size === 'small' ? 0.8 : 1.2;
    sprite.scale.set(labelSize, labelSize * 0.5, 1);
    sprite.position.copy(cube.position);
    sprite.position.y += cube.userData.size === 'small' ? 0.4 : 0.7;
    
    scene.add(sprite);
    cube.userData.labelSprite = sprite;
}

// 存储B2-2盒子的位置，用于收回照片和粒子
let b2_2BoxPosition = new THREE.Vector3(0, -8, 0);

// 打开盒子并飞出照片和粒子
function openBox(cube) {
    if (isBoxOpened) return;
    isBoxOpened = true;
    photosAnimating = true;
    
    const boxPosition = cube.position.clone();
    b2_2BoxPosition = boxPosition.clone(); // 保存盒子位置
    
    // 盒子保持正着放，不旋转（位置保持在下方）
    cube.rotation.set(0, 0, 0);
    
    // 创建粒子（数量再增加一倍，从400到800）
    // 粒子主要围绕在照片周围（场景中心区域）
    const photoCenterPosition = new THREE.Vector3(0, 0, 0); // 照片围成的圆圈中心
    createParticles(photoCenterPosition, 800);
    
    // 创建照片并飞出（围成一圈，从盒子里直接飞出来）
    photoUrls.forEach((url, index) => {
        setTimeout(() => {
            createPhoto(url, boxPosition, index, photoCount);
        }, index * 100);
    });
}

// 获取B2-2盒子位置的函数（供HTML调用）
window.getB2_2BoxPosition = function() {
    return b2_2BoxPosition.clone();
};

// 创建彩色粒子（金色球体、红色钻石、绿色石块、黄色宝石）
function createParticles(startPosition, count) {
    for (let i = 0; i < count; i++) {
        let geometry;
        let color;
        // 珠宝圣诞主题：金色、金属红、金属绿等随机颜色
        const colorTypes = [
            { color: 0xffd700, name: '金色' },      // #FFD700 金色
            { color: 0xff6b6b, name: '金属红' },   // 金属红
            { color: 0x4caf50, name: '金属绿' },   // 金属绿
            { color: 0xc0c0c0, name: '银色' },     // 银色
            { color: 0xff1744, name: '深红' },     // 深红色
            { color: 0xffc107, name: '琥珀色' },    // 琥珀色
            { color: 0x9c27b0, name: '紫色' },     // 紫色
            { color: 0x00bcd4, name: '青色' }       // 青色
        ];
        
        const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
        color = new THREE.Color(colorType.color);
        
        // 随机选择几何形状
        const shapeType = Math.floor(Math.random() * 3); // 0: 球体, 1: 八面体, 2: 不规则
        const size = (Math.random() * 0.15 + 0.08) * 0.5; // 缩小一半
        
        switch(shapeType) {
            case 0: // 球体
                geometry = new THREE.SphereGeometry(size, 32, 32);
                break;
            case 1: // 八面体（钻石形状）
                geometry = new THREE.OctahedronGeometry(size, 0);
                break;
            case 2: // 不规则形状
                geometry = new THREE.BoxGeometry(size, size * 0.7, size * 0.8);
                break;
        }
        
        // 根据颜色类型设置材质属性（金属色有更强的反光）
        const isMetallic = colorType.name.includes('金') || colorType.name.includes('银') || 
                          colorType.name.includes('金属');
        
        // 根据颜色类型设置不同的材质属性（金属色有更强的反光，珠宝圣诞主题，放大高光光圈）
        let material;
        if (isMetallic) {
            // 金属色：强反光，珠宝质感，更大的高光区域
            material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.3,
                metalness: 1.0, // 纯金属
                roughness: 0.05, // 非常低的粗糙度，产生更大的高光光圈（至少放大一倍）
                envMapIntensity: 4.0 // 更高的环境贴图强度（基础值），增强反光
            });
        } else {
            // 其他颜色：有光泽但反光较弱，更大的高光区域
            material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.4,
                metalness: 0.7,
                roughness: 0.1, // 降低粗糙度，产生更大的高光光圈
                envMapIntensity: 2.0 // 增强环境贴图强度
            });
        }
        
        const particle = new THREE.Mesh(geometry, material);
        // 存储原始材质属性和类型，用于动态调整
        particle.userData.material = material;
        particle.userData.isMetallic = isMetallic; // 存储是否为金属色
        particle.userData.baseEnvMapIntensity = material.envMapIntensity || 3.0;
        
        // 初始位置（围绕照片周围散布，在场景中心区域，无序混合分布）
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 12 + 3; // 半径范围3-15，覆盖照片圆圈周围
        
        // 在上下范围内随机分布，混合在一起（范围-7到7，覆盖上下三层但无序）
        const height = Math.random() * 14 - 7; // 高度范围-7到7，覆盖上下三层区域但无序混合
        
        particle.position.set(
            startPosition.x + Math.cos(angle) * radius,
            startPosition.y + height,
            startPosition.z + Math.sin(angle) * radius
        );
        
        // 随机旋转
        particle.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // 自由旋转动画（方向不限制，自由转）
        particle.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02, // 增加旋转速度变化
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        };
        
        // 上下漂浮动画（缓慢漂浮）
        particle.userData.floatSpeed = {
            x: (Math.random() - 0.5) * 0.008,
            y: Math.random() * 0.005 + 0.002, // 向上漂浮
            z: (Math.random() - 0.5) * 0.008
        };
        
        particle.userData.initialPosition = particle.position.clone();
        
        // 为每个粒子添加bling bling闪烁效果的时间参数
        particle.userData.blinkPhase = Math.random() * Math.PI * 2; // 随机闪烁相位，让每个粒子闪烁节奏不同
        particle.userData.blinkSpeed = 0.02 + Math.random() * 0.03; // 闪烁速度（0.02-0.05）
        particle.userData.baseEmissiveIntensity = isMetallic ? 0.3 : 0.4; // 存储基础发光强度
        
        particleGroup.add(particle);
        particles.push(particle);
    }
}

// 更新粒子动画（粒子旋转并上下漂浮，动态反光）
function updateParticles() {
    particles.forEach((particle) => {
        // 自由旋转，方向不限制
        particle.rotation.x += particle.userData.rotationSpeed.x;
        particle.rotation.y += particle.userData.rotationSpeed.y;
        particle.rotation.z += particle.userData.rotationSpeed.z;
        
        // 上下漂浮（缓慢漂浮）
        particle.position.x += particle.userData.floatSpeed.x;
        particle.position.y += particle.userData.floatSpeed.y;
        particle.position.z += particle.userData.floatSpeed.z;
        
        // 限制在范围内（让粒子在合理范围内浮动）
        const distance = particle.position.distanceTo(particle.userData.initialPosition);
        if (distance > 12) {
            particle.userData.floatSpeed.x *= -1;
            particle.userData.floatSpeed.z *= -1;
        }
        if (particle.position.y > particle.userData.initialPosition.y + 6 || 
            particle.position.y < particle.userData.initialPosition.y - 6) {
            particle.userData.floatSpeed.y *= -1;
        }
        
        // Bling bling闪烁效果：基于时间的闪烁动画
        const time = Date.now() * 0.001; // 转换为秒
        particle.userData.blinkPhase += particle.userData.blinkSpeed;
        
        // 使用多个正弦波叠加创建闪烁效果（更自然的闪烁）
        const blink1 = Math.sin(particle.userData.blinkPhase);
        const blink2 = Math.sin(particle.userData.blinkPhase * 1.7);
        const blink3 = Math.sin(particle.userData.blinkPhase * 2.3);
        const combinedBlink = (blink1 + blink2 * 0.5 + blink3 * 0.3) / 1.8;
        // 将闪烁值映射到0-1范围，然后用它来创建强烈的闪烁（峰值时非常亮）
        const blinkNormalized = (combinedBlink + 1) / 2; // 0到1
        // 增强闪烁效果：在峰值时非常亮，创造bling bling效果
        const blinkIntensity = 0.3 + blinkNormalized * 1.5; // 0.3到1.8之间（强烈的闪烁）
        
        // 根据旋转角度动态调整反光效果（珠宝圣诞主题，增强反光）
        const rotX = particle.rotation.x;
        const rotY = particle.rotation.y;
        const rotZ = particle.rotation.z;
        
        // 使用正弦函数创建周期性的反光效果（不同频率，使反光更自然）
        const reflectIntensity = (Math.sin(rotX * 3) + Math.sin(rotY * 2.5) + Math.sin(rotZ * 2.8)) / 3;
        // 将值从-1到1映射到0到1
        const normalized = (reflectIntensity + 1) / 2; // 0到1
        
        if (particle.userData.material) {
            const material = particle.userData.material;
            const baseIntensity = particle.userData.baseEnvMapIntensity || 3.0;
            
            // 应用bling bling闪烁效果到发光强度
            material.emissiveIntensity = particle.userData.baseEmissiveIntensity * blinkIntensity;
            
            // 根据是否为金属色调整反光强度范围（增强反光效果，放大高光光圈）
            // 反光强度也会受到闪烁效果影响，创造更强的bling bling
            const blingMultiplier = 1.0 + blinkNormalized * 0.5; // 闪烁时反光也增强
            
            if (particle.userData.isMetallic) {
                // 金属色：非常强烈的反光，珠宝质感，更大的高光区域，bling bling闪烁
                // 反光强度在baseIntensity的1.0倍到6倍之间变化，并叠加闪烁效果
                material.envMapIntensity = baseIntensity * (1.0 + normalized * 5.0) * blingMultiplier;
                // 同时调整roughness，产生更大的高光光圈（至少放大一倍）
                material.roughness = 0.02 + (1 - normalized) * 0.03; // 0.02到0.05之间，非常光滑，更大的高光
            } else {
                // 其他颜色：较强的反光变化，更大的高光区域，bling bling闪烁
                material.envMapIntensity = baseIntensity * (0.8 + normalized * 2.7) * blingMultiplier;
                material.roughness = 0.05 + (1 - normalized) * 0.05; // 0.05到0.1之间，更大的高光光圈
            }
        }
    });
}

// 创建照片（围成一圈）
function createPhoto(url, startPosition, index, total) {
    const loader = new THREE.TextureLoader();
    
    // 照片大小不同（随机变化）
    const baseSize = 2;
    const sizeVariation = 0.5;
    const photoSize = baseSize + (Math.random() - 0.5) * sizeVariation;
    const photoGeometry = new THREE.PlaneGeometry(photoSize, photoSize);
    
    const photoMaterial = new THREE.MeshStandardMaterial({
        map: null,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });
    
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    
    // 初始位置（盒子中心）
    photoMesh.position.copy(startPosition);
    
    // 目标位置（围成一圈，在场景中心区域，远离底部的盒子，上下错落摆放）
    const radius = 8; // 圆圈半径
    const angle = (index / total) * Math.PI * 2;
    const centerY = 0; // 场景中心高度
    const heightVariation = 3; // 高度变化范围（减半，最高和最低图片距离更近）
    
    // 使用正弦波分布，让照片在垂直方向上更均匀地错落分布
    // 使用index而不是random，确保每次打开盒子时照片位置一致
    const heightOffset = Math.sin(index * 1.5) * heightVariation * 0.8 + 
                        Math.cos(index * 2.3) * heightVariation * 0.5;
    
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    const targetY = centerY + heightOffset;
    
    photoMesh.userData.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    photoMesh.userData.baseSize = photoSize; // 存储基础大小，用于距离缩放
    
    photoMesh.userData.isAnimating = true;
    photoMesh.userData.isSelected = false;
    photoMesh.userData.photoUrl = url;
    photoMesh.userData.photoName = `B2-2-${index + 1}`;
    
    // 加载纹理
    loader.load(url, (texture) => {
        photoMaterial.map = texture;
        photoMaterial.needsUpdate = true;
    }, undefined, (error) => {
        console.error('Error loading texture:', error);
    });
    
    photoGroup.add(photoMesh);
    photos.push(photoMesh);
    
    // 飞行动画
    animatePhotoFly(photoMesh);
}

// 照片飞行动画
function animatePhotoFly(photoMesh) {
    const startPos = photoMesh.position.clone();
    const targetPos = photoMesh.userData.targetPosition;
    const duration = 2000;
    const startTime = Date.now();
    
    // 照片从一开始就面向摄像机（正着），不需要旋转动画
    // Billboard效果会在updatePhotosBillboard中处理，让照片始终面向摄像机
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // 位置插值
        photoMesh.position.lerpVectors(startPos, targetPos, easeOut);
        
        // 透明度
        photoMesh.material.opacity = easeOut;
        
        // 确保照片始终保持正着（面向摄像机），Billboard效果会处理旋转
        // 这里不需要设置旋转，Billboard效果会在每帧更新时处理
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            photoMesh.userData.isAnimating = false;
            // 检查所有照片是否都完成了
            const allComplete = photos.every(p => !p.userData.isAnimating);
            photosAnimating = !allComplete;
        }
    };
    animate();
}

// 鼠标点击事件
function onMouseClick(event) {
    event.preventDefault();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (!isBoxOpened) {
        // 检测是否点击了B2-2盒子
        const b2_2Cube = cubeMap['B2-2'];
        if (b2_2Cube && b2_2Cube.visible) {
            const intersects = raycaster.intersectObject(b2_2Cube);
            if (intersects.length > 0) {
                openBox(b2_2Cube);
                return;
            }
        }
    } else {
        // 检测是否点击了照片
        const intersects = raycaster.intersectObjects(photos);
        if (intersects.length > 0) {
            const clickedPhoto = intersects[0].object;
            if (!clickedPhoto.userData.isSelected) {
                selectPhoto(clickedPhoto);
            }
            return;
        }
        
        // 点击空白处取消选择
        if (selectedPhoto) {
            deselectPhoto();
        }
    }
}

// 选择照片（放大）
function selectPhoto(photo) {
    if (selectedPhoto) {
        deselectPhoto();
    }
    
    selectedPhoto = photo;
    photo.userData.isSelected = true;
    photo.userData.originalPosition = photo.position.clone();
    
    // 放大动画（放大4倍，移动到屏幕正中心，保持面向摄像机）
    const targetScale = 4;
    
    // 计算屏幕正中心对应的3D位置（相机前方）
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); // 获取相机朝向
    const distance = 12; // 距离相机的距离
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(camera.position);
    targetPosition.add(direction.multiplyScalar(distance)); // 相机位置 + 方向 * 距离 = 屏幕正中心
    
    const duration = 500;
    const startTime = Date.now();
    const startScale = photo.scale.clone();
    const startPos = photo.position.clone();
    
    photo.userData.selectingAnimation = true; // 标记正在选择动画中
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        photo.scale.lerpVectors(startScale, new THREE.Vector3(targetScale, targetScale, 1), easeOut);
        photo.position.lerpVectors(startPos, targetPosition, easeOut);
        // 不需要设置旋转，因为Billboard效果会自动让照片面向摄像机
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            photo.userData.selectingAnimation = false;
            showPhotoDialog(photo);
        }
    };
    animate();
}

// 取消选择照片
function deselectPhoto() {
    if (!selectedPhoto) return;
    
    const photo = selectedPhoto;
    const duration = 800; // 增加动画时长，使动画更丝滑
    const startTime = Date.now();
    const startScale = photo.scale.clone();
    const startPos = photo.position.clone();
    const targetPos = photo.userData.originalPosition;
    
    // 获取原始缩放值（基于原始位置的距离）
    const originalDistance = targetPos.distanceTo(camera.position);
    const baseDistance = 15;
    const distanceScale = baseDistance / originalDistance;
    const targetScaleValue = Math.max(0.5, Math.min(2.0, distanceScale));
    const targetScale = new THREE.Vector3(targetScaleValue, targetScaleValue, 1);
    
    photo.userData.deselectingAnimation = true; // 标记正在取消选择动画中
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // 使用更平滑的缓动函数（ease-in-out cubic），让动画更丝滑
        const easeInOut = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // 位置恢复到原始位置
        photo.position.lerpVectors(startPos, targetPos, easeInOut);
        
        // 缩放平滑恢复到原始大小
        photo.scale.lerpVectors(startScale, targetScale, easeInOut);
        
        // 不需要设置旋转，因为Billboard效果会自动让照片面向摄像机
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            photo.userData.isSelected = false;
            photo.userData.deselectingAnimation = false;
        }
    };
    animate();
    
    selectedPhoto = null;
    hidePhotoDialog();
}

// 鼠标移动事件
function onMouseMove(event) {
    if (!isBoxOpened || photosAnimating) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 更新鼠标样式
    const intersects = raycaster.intersectObjects(photos);
    renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

// 更新照片的Billboard效果（始终面向摄像机，但保持平整稳定）
function updatePhotosBillboard() {
    if (!isBoxOpened) return;
    
    photos.forEach(photo => {
        // 对所有照片应用Billboard效果，包括正在飞行的照片
        // 这样照片从一开始就正着（面向摄像机）
        
        // 计算从照片到摄像机的方向向量
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, photo.position).normalize();
        
        // 只让照片在水平方向（Y轴）旋转来面向摄像机，保持垂直平整
        // 计算水平方向的角度（只考虑X和Z分量，忽略Y分量）
        const horizontalAngle = Math.atan2(direction.x, direction.z);
        
        // 设置旋转：X轴和Z轴保持为0（保持垂直平整），只在Y轴上旋转
        photo.rotation.x = 0; // 保持垂直，不倾斜
        photo.rotation.y = horizontalAngle; // 水平旋转面向摄像机
        photo.rotation.z = 0; // 保持垂直，不倾斜
        
        // 根据距离摄像机的位置动态调整大小（靠近镜头自然放大）
        // 只有未选中且不在选择/取消选择动画中的照片才应用距离缩放
        if (!photo.userData.isSelected && !photo.userData.selectingAnimation && !photo.userData.deselectingAnimation) {
            const distance = photo.position.distanceTo(camera.position);
            // 基础距离参考值（可根据场景调整）
            const baseDistance = 15;
            // 距离越近，缩放越大（自然透视效果）
            const distanceScale = baseDistance / distance;
            // 限制缩放范围，避免过大或过小
            const clampedScale = Math.max(0.5, Math.min(2.0, distanceScale));
            photo.scale.set(clampedScale, clampedScale, 1);
        }
    });
}

// 显示照片对话框
function showPhotoDialog(photo) {
    const dialog = document.getElementById('photo-dialog');
    const dialogTitle = document.getElementById('dialog-title');
    const chatName = document.getElementById('dialog-chat-name');
    
    if (dialog && dialogTitle) {
        const photoName = photo.userData.photoName || '照片';
        dialogTitle.textContent = photoName;
        if (chatName) {
            chatName.textContent = photoName;
        }
        dialog.style.display = 'block';
        
        // 聚焦输入框
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            setTimeout(() => {
                chatInput.focus();
            }, 100);
        }
    }
}

// 隐藏照片对话框
function hidePhotoDialog() {
    const dialog = document.getElementById('photo-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    updateParticles();
    updatePhotosBillboard(); // 更新照片Billboard效果
    
    renderer.render(scene, camera);
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 重置相机
window.resetCamera = function() {
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

// 显示所有盒子
window.showAllCubes = function() {
    cubes.forEach(cube => {
        cube.visible = true;
        if (cube.userData.labelSprite) {
            cube.userData.labelSprite.visible = true;
        }
    });
}

// 暴露取消选择函数给全局
window.deselectPhoto = deselectPhoto;

// 收回所有照片和粒子到盒子
window.collectAllPhotosAndParticles = function(boxPosition) {
    // 先取消选中当前照片
    if (selectedPhoto) {
        selectedPhoto.userData.isSelected = false;
        selectedPhoto = null;
    }
    
    // 收回所有照片到盒子位置
    const photosToRemove = [...photos]; // 复制数组，避免在遍历时修改
    photosToRemove.forEach((photo, index) => {
        if (photo && photo.parent) {
            const duration = 1500;
            const startTime = Date.now();
            const startPos = photo.position.clone();
            const targetPos = boxPosition.clone();
            
            // 保存原始缩放，用于恢复
            const startScale = photo.scale.clone();
            const targetScale = new THREE.Vector3(0.1, 0.1, 1); // 缩小到几乎看不见
            
            photo.userData.isAnimating = true;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeIn = Math.pow(progress, 3); // 缓入动画
                
                photo.position.lerpVectors(startPos, targetPos, easeIn);
                photo.scale.lerpVectors(startScale, targetScale, easeIn);
                photo.material.opacity = 1 - easeIn; // 逐渐变透明
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    photo.userData.isAnimating = false;
                    // 移除照片
                    photoGroup.remove(photo);
                    if (photo.geometry) photo.geometry.dispose();
                    if (photo.material.map) photo.material.map.dispose();
                    if (photo.material) photo.material.dispose();
                }
            };
            
            // 延迟收回，让照片依次飞回
            setTimeout(() => {
                animate();
            }, index * 50);
        }
    });
    
    // 收回所有粒子到盒子位置
    const particlesToRemove = [...particles]; // 复制数组，避免在遍历时修改
    particlesToRemove.forEach((particle, index) => {
        if (particle && particle.parent) {
            const duration = 1500;
            const startTime = Date.now();
            const startPos = particle.position.clone();
            const targetPos = boxPosition.clone();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeIn = Math.pow(progress, 3); // 缓入动画
                
                particle.position.lerpVectors(startPos, targetPos, easeIn);
                const startScale = particle.scale.x;
                const targetScale = 0.01;
                const currentScale = startScale + (targetScale - startScale) * easeIn;
                particle.scale.setScalar(currentScale); // 缩小
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 移除粒子
                    particleGroup.remove(particle);
                    if (particle.geometry) particle.geometry.dispose();
                    if (particle.material) particle.material.dispose();
                }
            };
            
            // 延迟收回，让粒子依次飞回
            setTimeout(() => {
                animate();
            }, index * 5);
        }
    });
    
    // 清空数组
    setTimeout(() => {
        photos = [];
        particles = [];
        isBoxOpened = false;
        selectedPhoto = null;
        photosAnimating = false;
        hidePhotoDialog();
    }, 2000);
}

// 显示C2-2盒子（B2-2盒子保留在原地）
window.showC2_2Cube = function() {
    const c2_2Cube = cubeMap['C2-2'];
    if (c2_2Cube) {
        c2_2Cube.visible = true;
        if (c2_2Cube.userData.labelSprite) {
            c2_2Cube.userData.labelSprite.visible = true;
        }
    }
    
    // B2-2盒子保留在原地，不隐藏
};

// 初始化应用
init();

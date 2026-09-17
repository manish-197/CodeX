import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Sparkles, AlertCircle, Heart } from 'lucide-react';

export default function HeartDigitalTwin({ heartRate = 0 }) {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 7.5);

    // Renderer with true transparency & antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    currentMount.appendChild(renderer.domElement);

    // Root Group
    const heartRoot = new THREE.Group();
    scene.add(heartRoot);

    // Procedural Myocardial Muscle Striation Bump Map
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Draw muscular fiber lines
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 500; i++) {
      ctx.beginPath();
      const startX = Math.random() * 512;
      const startY = Math.random() * 512;
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + Math.random() * 40 - 20, startY + 30,
        startX + Math.random() * 40 - 20, startY + 60,
        startX + Math.random() * 30 - 15, startY + 90
      );
      ctx.stroke();
    }
    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(2, 2);

    // Materials
    // Deep Teal Myocardium
    const muscleMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0F5E5E'),
      roughness: 0.38,
      metalness: 0.12,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      bumpMap: bumpTexture,
      bumpScale: 0.04,
      emissive: new THREE.Color(heartRate > 0 ? '#E4714E' : '#0F5E5E'),
      emissiveIntensity: heartRate > 0 ? 0.35 : 0.06,
    });

    // Terracotta Vascular Material for Great Arteries
    const aortaMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E4714E'),
      roughness: 0.35,
      metalness: 0.15,
      bumpMap: bumpTexture,
      bumpScale: 0.02,
    });

    // Deep Pulmonary Cyan Material
    const pulmonaryMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F7A7A'),
      roughness: 0.4,
      metalness: 0.1,
    });

    // Gold Coronary Sulcus Material
    const coronaryMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F4B942'),
      roughness: 0.3,
      metalness: 0.25,
    });

    const heartBodyGroup = new THREE.Group();
    heartRoot.add(heartBodyGroup);

    // 1. Left Ventricle (Dominant muscular apex chamber, tilted infero-laterally)
    const lvGeo = new THREE.SphereGeometry(1.1, 36, 36);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let vx = lvPos.getX(i);
      let vy = lvPos.getY(i);
      let vz = lvPos.getZ(i);

      // Elongate downwards into anatomical apex
      if (vy < 0) {
        vy *= 1.45;
        vx *= (1 - Math.abs(vy) * 0.22);
        vz *= (1 - Math.abs(vy) * 0.22);
      }
      // Posterior bulge
      if (vz < 0) {
        vz *= 1.15;
      }
      lvPos.setXYZ(i, vx, vy, vz);
    }
    lvGeo.computeVertexNormals();
    const leftVentricle = new THREE.Mesh(lvGeo, muscleMaterial);
    leftVentricle.position.set(-0.25, -0.3, 0);
    leftVentricle.rotation.z = -0.18; // physiological left axis deviation
    heartBodyGroup.add(leftVentricle);

    // 2. Right Ventricle (Anterior crescentic chamber)
    const rvGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let vx = rvPos.getX(i);
      let vy = rvPos.getY(i);
      let vz = rvPos.getZ(i);
      if (vy < 0) vy *= 1.25;
      // Flatten towards the interventricular septum
      if (vx < 0) vx *= 0.85;
      rvPos.setXYZ(i, vx, vy, vz);
    }
    rvGeo.computeVertexNormals();
    const rightVentricle = new THREE.Mesh(rvGeo, muscleMaterial);
    rightVentricle.position.set(0.45, -0.15, 0.25);
    rightVentricle.rotation.z = 0.15;
    heartBodyGroup.add(rightVentricle);

    // 3. Right Atrium & Auricle
    const raGeo = new THREE.SphereGeometry(0.68, 28, 28);
    const raMesh = new THREE.Mesh(raGeo, muscleMaterial);
    raMesh.position.set(0.72, 0.75, 0.1);
    heartBodyGroup.add(raMesh);

    // 4. Left Atrium & Auricle
    const laGeo = new THREE.SphereGeometry(0.65, 28, 28);
    const laMesh = new THREE.Mesh(laGeo, muscleMaterial);
    laMesh.position.set(-0.65, 0.78, -0.2);
    heartBodyGroup.add(laMesh);

    // 5. Interventricular Coronary Artery (Anterior Sulcus)
    const sulcusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.7, 0.65),
      new THREE.Vector3(0.12, 0.2, 0.72),
      new THREE.Vector3(0.02, -0.4, 0.62),
      new THREE.Vector3(-0.15, -1.0, 0.42),
      new THREE.Vector3(-0.35, -1.45, 0.1),
    ]);
    const sulcusGeo = new THREE.TubeGeometry(sulcusCurve, 28, 0.045, 8, false);
    const sulcusMesh = new THREE.Mesh(sulcusGeo, coronaryMaterial);
    heartBodyGroup.add(sulcusMesh);

    // 6. Ascending Aorta & Anatomical Aortic Arch with 3 branches
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.6, 0.1),
      new THREE.Vector3(0.05, 1.1, 0.05),
      new THREE.Vector3(-0.1, 1.55, -0.05),
      new THREE.Vector3(-0.45, 1.6, -0.2),
      new THREE.Vector3(-0.7, 1.25, -0.35),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.17, 16, false);
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMaterial);
    heartBodyGroup.add(aortaMesh);

    // 3 Arch Branches: Brachiocephalic, Common Carotid, Subclavian
    const b1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 1.45, 0.0),
      new THREE.Vector3(0.12, 1.85, 0.05)
    ]);
    const b1 = new THREE.Mesh(new THREE.TubeGeometry(b1Curve, 8, 0.055, 8, false), aortaMaterial);
    heartBodyGroup.add(b1);

    const b2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 1.58, -0.08),
      new THREE.Vector3(-0.14, 1.92, -0.05)
    ]);
    const b2 = new THREE.Mesh(new THREE.TubeGeometry(b2Curve, 8, 0.045, 8, false), aortaMaterial);
    heartBodyGroup.add(b2);

    const b3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 1.55, -0.15),
      new THREE.Vector3(-0.38, 1.88, -0.12)
    ]);
    const b3 = new THREE.Mesh(new THREE.TubeGeometry(b3Curve, 8, 0.045, 8, false), aortaMaterial);
    heartBodyGroup.add(b3);

    // 7. Pulmonary Trunk (Bifurcating anterior to aorta)
    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.6, 0.35),
      new THREE.Vector3(0.0, 1.0, 0.3),
      new THREE.Vector3(-0.25, 1.2, 0.15),
    ]);
    const pulmonaryGeo = new THREE.TubeGeometry(pulmonaryCurve, 24, 0.15, 14, false);
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, pulmonaryMaterial);
    heartBodyGroup.add(pulmonaryMesh);

    // 8. Superior Vena Cava (Right superior venous trunk)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.72, 0.85, 0.0),
      new THREE.Vector3(0.72, 1.45, -0.05),
    ]);
    const svcMesh = new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 12, 0.14, 12, false), pulmonaryMaterial);
    heartBodyGroup.add(svcMesh);

    // Floating Bio-Sensor Particle Ring
    const particlesCount = 90;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 2.4 + Math.random() * 0.8;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 2.2;
      particlePositions[i] = Math.cos(angle) * radius;
      particlePositions[i + 1] = yOffset;
      particlePositions[i + 2] = Math.sin(angle) * radius;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#F4B942'),
      size: 0.055,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    heartRoot.add(particles);

    // Professional Multi-Directional Studio & Rim Lighting
    // 1. Ambient baseline
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // 2. Key Light (Warm top-front)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // 3. Cool Rim Backlight (Accentuates anatomical contours)
    const rimLight = new THREE.DirectionalLight(0xeaf4f4, 2.4);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    // 4. Warm Terracotta Fill Light
    const fillLight = new THREE.DirectionalLight(0xe4714e, 1.2);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    // 5. Deep Teal Center Point Light for organic internal glow
    const innerLight = new THREE.PointLight(0x0f5e5e, 1.5, 6);
    innerLight.position.set(0, 0, 1);
    scene.add(innerLight);

    // Pointer Drag Physics
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      heartRoot.rotation.y += dx * 0.009;
      heartRoot.rotation.x += dy * 0.009;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle ambient floating orientation
      if (!isDragging) {
        heartRoot.rotation.y += 0.005;
        heartRoot.rotation.x = Math.sin(time * 0.6) * 0.08;
      }
      particles.rotation.y -= 0.003;

      // Realistic anatomical cardiac cycle
      if (heartRate > 0) {
        // Frequency proportional to real BPM
        const freq = (heartRate / 60) * Math.PI * 2;
        const cycle = (time * freq) % (Math.PI * 2);
        
        // Ventricular systole contraction curve
        const beat = Math.pow(Math.sin(cycle), 4);
        const scaleMod = 1 + beat * 0.08;
        heartBodyGroup.scale.set(scaleMod, scaleMod * 0.96, scaleMod);
        muscleMaterial.emissiveIntensity = 0.15 + beat * 0.75;
      } else {
        // 0 BPM: Slow idle breathing rhythm (NOT a fake fast beating heart!)
        const idleBreathing = Math.sin(time * 1.4) * 0.015;
        heartBodyGroup.scale.set(1 + idleBreathing, 1 + idleBreathing, 1 + idleBreathing);
        muscleMaterial.emissiveIntensity = 0.06 + Math.sin(time * 1.4) * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const nw = currentMount.clientWidth;
      const nh = currentMount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      lvGeo.dispose();
      rvGeo.dispose();
      raGeo.dispose();
      laGeo.dispose();
      sulcusGeo.dispose();
      aortaGeo.dispose();
      pulmonaryGeo.dispose();
      particleGeometry.dispose();
      muscleMaterial.dispose();
      aortaMaterial.dispose();
      pulmonaryMaterial.dispose();
      coronaryMaterial.dispose();
      particleMaterial.dispose();
      bumpTexture.dispose();
    };
  }, [heartRate]);

  return (
    <div 
      className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Status Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex items-center gap-2.5 text-xs font-semibold shadow-lg whitespace-nowrap border border-white/60 dark:border-white/10">
        <div className={`w-2.5 h-2.5 rounded-full ${heartRate > 0 ? 'bg-terracotta animate-ping' : 'bg-deep-teal/40 dark:bg-sky-mist/40'}`} />
        <span className="text-deep-teal dark:text-sky-mist font-bold">
          {heartRate > 0 ? (
            <>Live Cardiac Rhythm: <strong className="text-terracotta">{heartRate} BPM</strong></>
          ) : (
            <span className="flex items-center gap-1.5 text-deep-teal/80 dark:text-sky-mist/80">
              <Activity className="w-3.5 h-3.5 text-deep-teal dark:text-sun-gold" />
              <span>Anatomical Bio-Twin • 0 BPM (Idle)</span>
            </span>
          )}
        </span>
      </div>

      {/* Zero Dummy Data Indicator tooltip on hover */}
      {isHovered && heartRate === 0 && (
        <div className="absolute top-3 right-3 glass-card p-3 text-[11px] text-deep-teal dark:text-sky-mist max-w-[200px] shadow-xl animate-fadeIn border border-terracotta/30">
          <p className="flex items-center gap-1.5 font-bold text-terracotta">
            <AlertCircle className="w-3.5 h-3.5" /> Zero Dummy Data
          </p>
          <p className="mt-1 leading-relaxed text-deep-teal/80 dark:text-sky-mist/80">
            Anatomical model animates with real heart rhythm once logged or synced via Bluetooth.
          </p>
        </div>
      )}
    </div>
  );
}

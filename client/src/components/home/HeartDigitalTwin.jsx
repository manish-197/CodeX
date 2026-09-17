import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Anatomical 3D Cardiac Digital Twin
 * High-fidelity anatomical Three.js model featuring:
 * - 4 distinct cardiac chambers (Left/Right Ventricles & Atria) with anatomical asymmetry
 * - Ascending Aorta, Aortic Arch with 3 supra-aortic branches (Brachiocephalic, Carotid, Subclavian)
 * - Bifurcating Pulmonary Trunk (Left & Right Pulmonary Arteries) & Superior Vena Cava
 * - Anterior and Posterior Coronary Artery Sulci (LAD & RCA)
 * - MeshPhysicalMaterial with realistic subsurface tissue sheen and fibrous bump mapping
 * - 3-Point Studio Lighting (Key, Fill, Rim) for anatomical depth
 * - Synced physiological cardiac pulse cycle:
 *     • 0 BPM = Slow idle breathing rhythm
 *     • >0 BPM = Real-time heart rate pulse with ventricular systole expansion
 */
export default function HeartDigitalTwin({ heartRate = 0 }) {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0.15, 7.2);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    currentMount.appendChild(renderer.domElement);

    // 3. Root Transformation Hierarchy
    const heartRoot = new THREE.Group();
    scene.add(heartRoot);

    const heartBodyGroup = new THREE.Group();
    heartRoot.add(heartBodyGroup);

    // 4. Procedural Myocardial Tissue & Vascular Micro-Texture
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const ctx = bumpCanvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Muscular striations
    ctx.strokeStyle = '#a8a8a8';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 600; i++) {
      ctx.beginPath();
      const startX = Math.random() * 512;
      const startY = Math.random() * 512;
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + Math.random() * 30 - 15, startY + 25,
        startX + Math.random() * 30 - 15, startY + 50,
        startX + Math.random() * 20 - 10, startY + 75
      );
      ctx.stroke();
    }
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(2, 2);

    // 5. Anatomical Physical Materials (Subsurface / Soft-Tissue look)
    // Deep Myocardium (Left & Right Ventricular walls)
    const muscleMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0B3B5B'),
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
      sheen: 0.75,
      sheenRoughness: 0.25,
      sheenColor: new THREE.Color('#38BDF8'),
      reflectivity: 0.65,
      bumpMap: bumpTexture,
      bumpScale: 0.035,
      emissive: new THREE.Color(heartRate > 0 ? '#2563A6' : '#0B2A4A'),
      emissiveIntensity: heartRate > 0 ? 0.35 : 0.08,
    });

    // Ascending Aorta & Major Elastic Arterial Vessel Material
    const aortaMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#2563A6'),
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      sheen: 0.6,
      sheenColor: new THREE.Color('#93C5FD'),
      bumpMap: bumpTexture,
      bumpScale: 0.02,
    });

    // Pulmonary Arteries & Venous Trunks Material
    const venousMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#164E63'),
      roughness: 0.35,
      metalness: 0.08,
      clearcoat: 0.7,
      sheen: 0.5,
      sheenColor: new THREE.Color('#67E8F9'),
    });

    // Coronary Arteries (Left Anterior Descending & Right Coronary Artery)
    const coronaryMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8A93A'),
      roughness: 0.25,
      metalness: 0.35,
    });

    // 6. Anatomical Geometry Modeling (4 Chambers + Vascular Tree)

    // Chamber 1: Left Ventricle (LV) — Dominant conical apex pointing inferior-anteriorly
    const lvGeo = new THREE.SphereGeometry(1.08, 36, 36);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);

      // Anatomical apex elongation downwards
      if (y < 0) {
        y *= 1.48;
        x *= (1 - Math.abs(y) * 0.24);
        z *= (1 - Math.abs(y) * 0.24);
      }
      // Posterior wall curvature
      if (z < 0) z *= 1.12;

      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();
    const leftVentricle = new THREE.Mesh(lvGeo, muscleMaterial);
    leftVentricle.position.set(-0.28, -0.35, 0);
    leftVentricle.rotation.z = -0.2; // Left axis deviation
    heartBodyGroup.add(leftVentricle);

    // Chamber 2: Right Ventricle (RV) — Semilunar anterior chamber wrapping around septum
    const rvGeo = new THREE.SphereGeometry(0.92, 32, 32);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);

      if (y < 0) y *= 1.25;
      if (x < 0) x *= 0.82; // Flattened towards septum
      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();
    const rightVentricle = new THREE.Mesh(rvGeo, muscleMaterial);
    rightVentricle.position.set(0.42, -0.18, 0.26);
    rightVentricle.rotation.z = 0.16;
    heartBodyGroup.add(rightVentricle);

    // Chamber 3: Right Atrium (RA) & Auricle
    const raGeo = new THREE.SphereGeometry(0.66, 28, 28);
    const rightAtrium = new THREE.Mesh(raGeo, venousMaterial);
    rightAtrium.position.set(0.74, 0.72, 0.08);
    heartBodyGroup.add(rightAtrium);

    // Chamber 4: Left Atrium (LA) & Auricle
    const laGeo = new THREE.SphereGeometry(0.62, 28, 28);
    const leftAtrium = new THREE.Mesh(laGeo, muscleMaterial);
    leftAtrium.position.set(-0.62, 0.76, -0.22);
    heartBodyGroup.add(leftAtrium);

    // 7. Great Vessels & Arterial Branching

    // Ascending Aorta & Anatomical Aortic Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.58, 0.12),
      new THREE.Vector3(0.06, 1.12, 0.06),
      new THREE.Vector3(-0.12, 1.58, -0.06),
      new THREE.Vector3(-0.46, 1.62, -0.22),
      new THREE.Vector3(-0.72, 1.26, -0.36),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.16, 16, false);
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMaterial);
    heartBodyGroup.add(aortaMesh);

    // 3 Distinct Supra-Aortic Branches:
    // 1. Brachiocephalic Artery
    const b1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 1.46, 0.02),
      new THREE.Vector3(0.14, 1.88, 0.06),
    ]);
    const b1 = new THREE.Mesh(new THREE.TubeGeometry(b1Curve, 10, 0.052, 10, false), aortaMaterial);
    heartBodyGroup.add(b1);

    // 2. Left Common Carotid Artery
    const b2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 1.6, -0.08),
      new THREE.Vector3(-0.12, 1.94, -0.05),
    ]);
    const b2 = new THREE.Mesh(new THREE.TubeGeometry(b2Curve, 10, 0.044, 10, false), aortaMaterial);
    heartBodyGroup.add(b2);

    // 3. Left Subclavian Artery
    const b3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, 1.56, -0.16),
      new THREE.Vector3(-0.36, 1.9, -0.12),
    ]);
    const b3 = new THREE.Mesh(new THREE.TubeGeometry(b3Curve, 10, 0.044, 10, false), aortaMaterial);
    heartBodyGroup.add(b3);

    // Pulmonary Trunk (Emerges anterior to aorta and curves underneath the aortic arch)
    const ptCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.58, 0.36),
      new THREE.Vector3(0.02, 1.02, 0.32),
      new THREE.Vector3(-0.24, 1.22, 0.16),
    ]);
    const pulmonaryGeo = new THREE.TubeGeometry(ptCurve, 26, 0.145, 14, false);
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, venousMaterial);
    heartBodyGroup.add(pulmonaryMesh);

    // Pulmonary Bifurcation: Left and Right Pulmonary Arteries
    const lpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, 1.22, 0.16),
      new THREE.Vector3(-0.65, 1.28, -0.08),
    ]);
    const lpaMesh = new THREE.Mesh(new THREE.TubeGeometry(lpaCurve, 12, 0.09, 10, false), venousMaterial);
    heartBodyGroup.add(lpaMesh);

    const rpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, 1.22, 0.16),
      new THREE.Vector3(0.45, 1.18, -0.18),
    ]);
    const rpaMesh = new THREE.Mesh(new THREE.TubeGeometry(rpaCurve, 12, 0.09, 10, false), venousMaterial);
    heartBodyGroup.add(rpaMesh);

    // Superior Vena Cava (SVC)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.74, 0.82, 0.02),
      new THREE.Vector3(0.74, 1.48, -0.04),
    ]);
    const svcMesh = new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 14, 0.13, 12, false), venousMaterial);
    heartBodyGroup.add(svcMesh);

    // 8. Coronary Sulcus Arteries (Anterior Interventricular Artery / LAD)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.68, 0.64),
      new THREE.Vector3(0.14, 0.18, 0.72),
      new THREE.Vector3(0.02, -0.42, 0.62),
      new THREE.Vector3(-0.16, -1.02, 0.42),
      new THREE.Vector3(-0.36, -1.48, 0.1),
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 32, 0.042, 8, false);
    const ladMesh = new THREE.Mesh(ladGeo, coronaryMaterial);
    heartBodyGroup.add(ladMesh);

    // Right Coronary Artery (RCA in AV groove)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, 0.45, 0.52),
      new THREE.Vector3(0.55, 0.22, 0.46),
      new THREE.Vector3(0.72, -0.15, 0.32),
      new THREE.Vector3(0.52, -0.48, 0.12),
    ]);
    const rcaMesh = new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 24, 0.038, 8, false), coronaryMaterial);
    heartBodyGroup.add(rcaMesh);

    // 9. Floating Clinical Bio-Sensor Ring
    const particlesCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 2.4 + Math.random() * 0.7;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 2.0;
      particlePositions[i] = Math.cos(angle) * radius;
      particlePositions[i + 1] = yOffset;
      particlePositions[i + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color('#5FB3CE'),
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    heartRoot.add(particles);

    // 10. Clinical 3-Point Studio Lighting (Key, Fill, Rim)
    // Key Light (Bright frontal surgical focus)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.5, 5.5, 5.0);
    scene.add(keyLight);

    // Fill Light (Soft cyan/blue gradient fill)
    const fillLight = new THREE.DirectionalLight(0x5fb3ce, 1.2);
    fillLight.position.set(-4.5, -0.5, 3.5);
    scene.add(fillLight);

    // Rim Light (Sharp cyan edge contour from behind)
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 3.2);
    rimLight.position.set(0.0, 2.0, -5.5);
    scene.add(rimLight);

    // Ambient Baseline
    const ambientLight = new THREE.AmbientLight(0xf4f9fb, 0.85);
    scene.add(ambientLight);

    // Inner Myocardial Core Point Light
    const coreLight = new THREE.PointLight(0x2563a6, 1.6, 7);
    coreLight.position.set(0, 0, 0.8);
    scene.add(coreLight);

    // 11. Interactive Drag Physics with Smooth Damping
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      velocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      velocity = { x: dx * 0.008, y: dy * 0.008 };
      heartRoot.rotation.y += velocity.x;
      heartRoot.rotation.x += velocity.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    setIsLoading(false);

    // 12. Animation Loop: Real-Time Physiological Cardiac Rhythm
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Ambient rotation and inertia decay
      if (!isDragging) {
        heartRoot.rotation.y += 0.004 + velocity.x;
        heartRoot.rotation.x += velocity.y;
        velocity.x *= 0.95;
        velocity.y *= 0.95;
      }
      particles.rotation.y -= 0.002;

      // Physiological cardiac cycle
      if (heartRate > 0) {
        // Double-peak cardiac wave: Atrial contraction followed by strong Ventricular systole
        const freq = (heartRate / 60) * Math.PI * 2;
        const cycle = (time * freq) % (Math.PI * 2);
        
        // Ventricular systole peak
        const systole = Math.pow(Math.sin(cycle), 4);
        const scaleMod = 1 + systole * 0.09;
        heartBodyGroup.scale.set(scaleMod, scaleMod * 0.95, scaleMod);

        // Emissive pulse synced with systole
        muscleMaterial.emissiveIntensity = 0.15 + systole * 0.8;
        aortaMaterial.emissiveIntensity = 0.1 + systole * 0.5;
        coreLight.intensity = 1.2 + systole * 1.6;
      } else {
        // 0 BPM: Gentle resting idle breathing rhythm (0.22 Hz)
        const idleBreathing = Math.sin(time * 1.35) * 0.016;
        heartBodyGroup.scale.set(1 + idleBreathing, 1 + idleBreathing, 1 + idleBreathing);
        muscleMaterial.emissiveIntensity = 0.06 + Math.sin(time * 1.35) * 0.03;
        coreLight.intensity = 1.0;
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

    // Cleanup resources
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
      aortaGeo.dispose();
      pulmonaryGeo.dispose();
      ladGeo.dispose();
      particleGeo.dispose();
      muscleMaterial.dispose();
      aortaMaterial.dispose();
      venousMaterial.dispose();
      coronaryMaterial.dispose();
      particleMat.dispose();
      bumpTexture.dispose();
    };
  }, [heartRate]);

  return (
    <div 
      className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Spinner Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <RefreshCw className="w-8 h-8 text-medical-blue animate-spin" />
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Cardiac Status Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex items-center gap-2.5 text-xs font-semibold shadow-lg whitespace-nowrap border border-white/60 dark:border-white/10">
        <div className={`w-2.5 h-2.5 rounded-full ${heartRate > 0 ? 'bg-medical-blue animate-ping' : 'bg-soft-cyan/60'}`} />
        <span className="text-deep-navy dark:text-clinical-white font-bold">
          {heartRate > 0 ? (
            <>Live Cardiac Rhythm: <strong className="text-medical-blue">{heartRate} BPM</strong></>
          ) : (
            <span className="flex items-center gap-1.5 text-deep-navy/80 dark:text-clinical-white/80">
              <Activity className="w-3.5 h-3.5 text-soft-cyan" />
              <span>Anatomical Bio-Twin • 0 BPM (Idle)</span>
            </span>
          )}
        </span>
      </div>

      {/* Zero Dummy Data Guidance Tooltip on Hover */}
      {isHovered && heartRate === 0 && (
        <div className="absolute top-3 right-3 glass-card p-3 text-[11px] text-deep-navy dark:text-clinical-white max-w-[210px] shadow-xl animate-fadeIn border border-medical-blue/30">
          <p className="flex items-center gap-1.5 font-bold text-medical-blue">
            <AlertCircle className="w-3.5 h-3.5" /> Zero Dummy Data
          </p>
          <p className="mt-1 leading-relaxed text-deep-navy/80 dark:text-clinical-white/80">
            Anatomical 3D model pulses with real heart rate once recorded in Vitals or synced via Bluetooth.
          </p>
        </div>
      )}
    </div>
  );
}

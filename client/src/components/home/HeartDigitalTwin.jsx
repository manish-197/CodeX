import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Sparkles, AlertCircle } from 'lucide-react';

export default function HeartDigitalTwin({ heartRate = 0 }) {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Heart Group
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // Construct stylized anatomical 3D heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 4,
      bevelSize: 0.2,
      bevelThickness: 0.25,
    };

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeometry.center();

    // Material in --deep-teal (#0F5E5E) with pulsing emissive glow
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0F5E5E'),
      emissive: new THREE.Color(heartRate > 0 ? '#E4714E' : '#0F5E5E'),
      emissiveIntensity: heartRate > 0 ? 0.45 : 0.08,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.rotation.z = Math.PI;
    heartMesh.scale.set(2.4, 2.4, 2.4);
    heartGroup.add(heartMesh);

    // Anatomical Great Vessels (Aorta and Vena Cava arches)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 1.2, 0),
      new THREE.Vector3(0.3, 1.8, 0.1),
      new THREE.Vector3(-0.3, 2.0, -0.1),
      new THREE.Vector3(-0.6, 1.6, -0.2),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 20, 0.18, 12, false);
    const vesselMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E4714E'),
      roughness: 0.4,
      metalness: 0.1,
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, vesselMat);
    heartGroup.add(aortaMesh);

    // Pulmonary Artery Branch
    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 1.0, 0.2),
      new THREE.Vector3(-0.5, 1.4, 0.2),
      new THREE.Vector3(-0.8, 1.5, 0.1),
    ]);
    const pulmonaryGeo = new THREE.TubeGeometry(pulmonaryCurve, 16, 0.14, 10, false);
    const pulmonaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A8686'),
      roughness: 0.4,
    });
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, pulmonaryMat);
    heartGroup.add(pulmonaryMesh);

    // Floating Bio-sensor Particle Halo
    const particlesCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 0.9;
      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#F4B942'),
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    heartGroup.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe4714e, 1.2);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    const tealGlow = new THREE.PointLight(0x0f5e5e, 2, 8);
    tealGlow.position.set(0, 0, 2);
    scene.add(tealGlow);

    // Interactive pointer drag / rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      heartGroup.rotation.y += deltaX * 0.008;
      heartGroup.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous ambient drift
      if (!isDragging) {
        heartGroup.rotation.y += 0.004;
        heartGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08;
      }
      particleSystem.rotation.y -= 0.002;

      // Pulse physics synced strictly to actual heart rate
      if (heartRate > 0) {
        // Frequency proportional to BPM
        const freq = (heartRate / 60) * Math.PI * 2;
        const pulse = Math.sin(elapsedTime * freq);
        const beatFactor = Math.pow(Math.max(0, pulse), 4);
        
        // Emissive flash + organic chamber expansion
        const scaleMod = 1 + beatFactor * 0.09;
        heartMesh.scale.set(2.4 * scaleMod, 2.4 * scaleMod, 2.4 * scaleMod);
        heartMaterial.emissiveIntensity = 0.2 + beatFactor * 0.7;
      } else {
        // Zero BPM: strictly static/idle dim state — NO fake beating!
        heartMesh.scale.set(2.4, 2.4, 2.4);
        heartMaterial.emissiveIntensity = 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
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
      heartGeometry.dispose();
      heartMaterial.dispose();
      aortaGeo.dispose();
      vesselMat.dispose();
      pulmonaryGeo.dispose();
      pulmonaryMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [heartRate]);

  return (
    <div 
      className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Status Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 neo-glass-card px-4 py-2 flex items-center gap-2.5 text-xs font-semibold shadow-md whitespace-nowrap">
        <div className={`w-2.5 h-2.5 rounded-full ${heartRate > 0 ? 'bg-terracotta animate-ping' : 'bg-deep-teal/40'}`} />
        <span className="text-deep-teal dark:text-sky-mist">
          {heartRate > 0 ? (
            <>Live Rhythm: <strong className="text-terracotta">{heartRate} BPM</strong></>
          ) : (
            <span className="flex items-center gap-1 text-deep-teal/70 dark:text-dark-muted">
              <Activity className="w-3.5 h-3.5" /> 3D Digital Twin • 0 BPM (Idle)
            </span>
          )}
        </span>
      </div>

      {/* Zero Dummy Data Indicator tooltip on hover */}
      {isHovered && heartRate === 0 && (
        <div className="absolute top-2 right-2 neo-glass-card p-2 text-[11px] text-deep-teal/80 dark:text-sky-mist max-w-[180px] shadow-lg animate-fadeIn border border-deep-teal/15">
          <p className="flex items-center gap-1 font-bold text-terracotta">
            <AlertCircle className="w-3 h-3" /> Zero Dummy Data
          </p>
          <p className="mt-0.5 leading-tight">
            Twin pulsates only when real vitals are logged or synced via Bluetooth.
          </p>
        </div>
      )}
    </div>
  );
}

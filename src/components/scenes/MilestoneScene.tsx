import { useEffect, useRef, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import Lottie from 'lottie-react';
import type { Milestone } from '@/types';
import { Icon } from '@/components/Icon';
import { isLowTierDevice } from '@/utils/deviceTier';

function SpinningBadge() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 2;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1, 0.3, 16, 64]} />
      <meshStandardMaterial color="#FCD34D" metalness={0.9} roughness={0.2} />
    </mesh>
  );
}

interface Props {
  milestone: Milestone | null;
  onClose: () => void;
}

export function MilestoneScene({ milestone, onClose }: Props) {
  const [confettiAnim, setConfettiAnim] = useState<unknown | null>(null);

  useEffect(() => {
    if (!milestone) return;
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [milestone, onClose]);

  useEffect(() => {
    if (!milestone || confettiAnim) return;
    fetch('/assets/lottie/confetti.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfettiAnim)
      .catch(() => setConfettiAnim(null));
  }, [milestone, confettiAnim]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {confettiAnim != null ? (
            <div className="absolute inset-0 pointer-events-none">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Lottie animationData={confettiAnim as any} loop autoplay />
            </div>
          ) : null}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="flex flex-col items-center gap-4 relative z-10"
          >
            {isLowTierDevice() ? (
              <Icon type="milestone" name={milestone.icon} size={180} animated />
            ) : (
              <div style={{ width: 220, height: 220 }}>
                <Canvas camera={{ position: [0, 0, 4] }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[3, 3, 3]} intensity={1.2} />
                  <Suspense fallback={null}>
                    <SpinningBadge />
                  </Suspense>
                </Canvas>
              </div>
            )}
            <h2 className="text-3xl font-bold text-white">🎉 {milestone.name} 解锁！</h2>
            <p className="text-white/80">{milestone.description}</p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2 bg-white text-gray-900 rounded-big font-bold"
            >
              太棒了
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

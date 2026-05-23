import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';
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
  useEffect(() => {
    if (!milestone) return;
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [milestone, onClose]);

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
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="flex flex-col items-center gap-4"
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

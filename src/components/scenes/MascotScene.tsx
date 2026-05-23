import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Mesh } from 'three';
import { isLowTierDevice } from '@/utils/deviceTier';
import { Icon } from '@/components/Icon';

function BearBlob() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.4;
    ref.current.position.y = Math.sin(performance.now() * 0.002) * 0.1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#A0522D" roughness={0.5} />
    </mesh>
  );
}

export function MascotScene({ size = 120 }: { size?: number }) {
  if (isLowTierDevice()) {
    return <Icon type="child" name="bear" size={size} animated />;
  }
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Suspense fallback={null}>
          <BearBlob />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}

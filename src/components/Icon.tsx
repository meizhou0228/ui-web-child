import { motion } from 'framer-motion';
import type { IconType } from '@/constants/iconCatalog';

interface IconProps {
  type: IconType;
  name: string;
  size?: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

function folderFor(type: IconType): string {
  if (type === 'category') return 'categories';
  if (type === 'child') return 'child';
  return `${type}s`;
}

export function Icon({ type, name, size = 64, animated = false, className, onClick }: IconProps) {
  const folder = folderFor(type);
  const src = `/assets/icons/${folder}/${name}.png`;
  return (
    <motion.img
      src={src}
      width={size}
      height={size}
      whileHover={animated ? { scale: 1.15, rotate: [0, -5, 5, 0] } : undefined}
      whileTap={animated ? { scale: 0.92 } : undefined}
      transition={{ duration: 0.3 }}
      loading="lazy"
      alt={name}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = `/assets/icons/${folder}/_fallback.png`;
        }
      }}
      onClick={onClick}
      className={className}
      style={{ display: 'inline-block', objectFit: 'contain' }}
    />
  );
}

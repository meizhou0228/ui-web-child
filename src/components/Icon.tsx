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

export function Icon({ type, name, size = 64, animated = false, className, onClick }: IconProps) {
  const src = `/assets/icons/${type === 'category' ? 'categories' : `${type}s`}/${name}.webp`;
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
        (e.currentTarget as HTMLImageElement).src = `/assets/icons/${type === 'category' ? 'categories' : `${type}s`}/_fallback.webp`;
      }}
      onClick={onClick}
      className={className}
      style={{ display: 'inline-block', objectFit: 'contain' }}
    />
  );
}

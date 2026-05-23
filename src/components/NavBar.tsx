import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ListChecks, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/',         label: '今日', icon: Home },
  { to: '/history',  label: '明细', icon: ListChecks },
  { to: '/shop',     label: '商店', icon: ShoppingBag },
  { to: '/stats',    label: '统计', icon: BarChart3 },
  { to: '/settings', label: '设置', icon: Settings },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {ITEMS.map(({ to, label, icon: I }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 ${isActive ? 'text-sky-700' : 'text-gray-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div animate={isActive ? { scale: 1.15 } : { scale: 1 }}>
                  <I size={22} />
                </motion.div>
                <span className="text-xs mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

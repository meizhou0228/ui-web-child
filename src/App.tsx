import { Routes, Route } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MilestoneScene } from '@/components/scenes/MilestoneScene';
import { useStore } from '@/store';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useAppIcon } from '@/hooks/useAppIcon';
import { TodayPage } from '@/pages/TodayPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ShopPage } from '@/pages/ShopPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  useBootstrap();
  useAppIcon();
  const unlocked = useStore((s) => s.recentlyUnlocked);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="max-w-md mx-auto pb-20 min-h-screen">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
          <NavBar />
          <MilestoneScene milestone={unlocked} onClose={() => setUnlocked(null)} />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

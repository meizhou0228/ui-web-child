import { useState } from 'react';
import { ChildSection } from './ChildSection';
import { TasksSection } from './TasksSection';
import { RewardsSection } from './RewardsSection';
import { DataSection } from './DataSection';

type Tab = 'child' | 'tasks' | 'rewards' | 'data';

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('child');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">设置</h1>
      <div className="flex gap-2 overflow-x-auto">
        {(['child', 'tasks', 'rewards', 'data'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-big whitespace-nowrap ${
              tab === t ? 'bg-sky-brand text-white' : 'bg-white shadow-soft'
            }`}
          >{ {child:'宝宝', tasks:'任务', rewards:'奖励', data:'数据'}[t] }</button>
        ))}
      </div>

      {tab === 'child' && <ChildSection />}
      {tab === 'tasks' && <TasksSection />}
      {tab === 'rewards' && <RewardsSection />}
      {tab === 'data' && <DataSection />}
    </div>
  );
}

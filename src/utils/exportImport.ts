import { z } from 'zod';
import type { AppStore } from '@/store';

const ExportSchema = z.object({
  version: z.number(),
  exportedAt: z.number(),
  child: z.any(),
  tasks: z.array(z.any()),
  records: z.array(z.any()),
  rewards: z.array(z.any()),
  redemptions: z.array(z.any()),
  milestones: z.array(z.any()),
  unlockedMilestones: z.array(z.any()),
});

export type ExportPayload = z.infer<typeof ExportSchema>;

export function buildExport(state: AppStore): ExportPayload {
  return {
    version: 1,
    exportedAt: Date.now(),
    child: state.child,
    tasks: state.tasks,
    records: state.records,
    rewards: state.rewards,
    redemptions: state.redemptions,
    milestones: state.milestones,
    unlockedMilestones: state.unlockedMilestones,
  };
}

export function parseImport(json: string): ExportPayload {
  const parsed = JSON.parse(json);
  return ExportSchema.parse(parsed);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

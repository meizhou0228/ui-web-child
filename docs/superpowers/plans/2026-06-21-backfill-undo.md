# 补打卡 Row-Level Undo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the 补打卡 modal undo a mis-tap by removing the most recent backfilled record for a task on the selected day.

**Architecture:** UI-only change in `BackfillModal`; reuses the existing `removeRecord` store action (force-delete, no undo window). A per-row `✕ 撤销` control appears when a backfilled record exists for the selected day.

**Tech Stack:** React 18 + TypeScript, Zustand, Vitest + Testing Library.

---

## Task 1: Row-level undo in BackfillModal

**Files:**
- Modify: `src/components/BackfillModal.tsx`
- Test: `src/components/__tests__/BackfillModal.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add these two tests inside the `describe('BackfillModal', ...)` block in
`src/components/__tests__/BackfillModal.test.tsx`:

```tsx
  it('shows no undo control before any backfill exists', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    expect(screen.queryByLabelText(`undo-backfill-${t.id}`)).toBeNull();
  });

  it('undoes a backfilled record from the task row', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(1);
    fireEvent.click(screen.getByLabelText(`undo-backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(0);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/__tests__/BackfillModal.test.tsx -t "undo"`
Expected: FAIL — no element with label `undo-backfill-<id>`.

- [ ] **Step 3: Add removeRecord + the undo control**

In `src/components/BackfillModal.tsx`:

1. Read `removeRecord` from the store, alongside the other store hooks:

```tsx
  const backfillCheckIn = useStore((s) => s.backfillCheckIn);
  const removeRecord = useStore((s) => s.removeRecord);
```

2. Add an undo handler next to `handleTap`:

```tsx
  function handleUndo(recordId: string, name: string) {
    removeRecord(recordId);
    toast.show('info', `已撤销 ${name}`);
  }
```

3. In the task list `map`, compute the latest backfilled record for the selected day and
render the control. Replace the existing row body:

```tsx
              {activeTasks.map((t) => {
                const count = records.filter((r) => r.taskId === t.id && r.date === selected).length;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => handleTap(t.id, t.name, t.points)}
                      aria-label={`backfill-${t.id}`}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-big shadow-soft text-left"
                    >
                      <Icon type="task" name={t.icon} size={40} />
                      <div className="flex-1">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          +{t.points} 分{count > 0 ? ` · 已记 ${count} 次` : ''}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
```

with:

```tsx
              {activeTasks.map((t) => {
                const dayRecords = records.filter((r) => r.taskId === t.id && r.date === selected);
                const count = dayRecords.length;
                const lastBackfilled = dayRecords
                  .filter((r) => r.backfilled)
                  .sort((a, b) => b.timestamp - a.timestamp)[0];
                return (
                  <li key={t.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleTap(t.id, t.name, t.points)}
                      aria-label={`backfill-${t.id}`}
                      className="flex-1 flex items-center gap-3 p-3 bg-white rounded-big shadow-soft text-left"
                    >
                      <Icon type="task" name={t.icon} size={40} />
                      <div className="flex-1">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          +{t.points} 分{count > 0 ? ` · 已记 ${count} 次` : ''}
                        </div>
                      </div>
                    </button>
                    {lastBackfilled && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUndo(lastBackfilled.id, t.name); }}
                        aria-label={`undo-backfill-${t.id}`}
                        className="shrink-0 px-3 py-2 rounded-big bg-gray-100 text-gray-500 text-sm font-bold"
                      >✕ 撤销</button>
                    )}
                  </li>
                );
              })}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/__tests__/BackfillModal.test.tsx`
Expected: PASS — all BackfillModal tests (original two plus the new two).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/BackfillModal.tsx src/components/__tests__/BackfillModal.test.tsx
git commit -m "feat: allow undoing a backfilled check-in from the modal"
```

---

## Task 2: Full verification

- [ ] **Step 1: Whole suite + typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all tests PASS, no type errors.

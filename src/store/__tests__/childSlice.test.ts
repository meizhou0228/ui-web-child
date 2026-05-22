import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createChildSlice, ChildSlice } from '../childSlice';

const makeStore = () => create<ChildSlice>()(immer((...a) => createChildSlice(...a)));

describe('childSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('defaults to a name "小宝"', () => {
    expect(store.getState().child.name).toBe('小宝');
  });

  it('setChildName updates name', () => {
    store.getState().setChildName('小明');
    expect(store.getState().child.name).toBe('小明');
  });

  it('setChildIcon updates icon', () => {
    store.getState().setChildIcon('fox');
    expect(store.getState().child.icon).toBe('fox');
  });

  it('setChildBirthday updates birthday', () => {
    store.getState().setChildBirthday('2020-01-01');
    expect(store.getState().child.birthday).toBe('2020-01-01');
  });
});

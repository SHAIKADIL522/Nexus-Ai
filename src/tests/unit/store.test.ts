import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore } from '@/store/workspace.store';

describe('WorkspaceStore', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      widgets: [], sessions: [], sidebarOpen: true, activeWidgetId: null,
    });
  });

  it('adds a widget', () => {
    const { addWidget } = useWorkspaceStore.getState();
    const id = addWidget({ type: 'notes', title: 'Test Note', data: 'hello' });
    expect(id).toBeTruthy();
    expect(useWorkspaceStore.getState().widgets).toHaveLength(1);
    expect(useWorkspaceStore.getState().widgets[0].title).toBe('Test Note');
  });

  it('removes a widget', () => {
    const { addWidget, removeWidget } = useWorkspaceStore.getState();
    const id = addWidget({ type: 'notes', title: 'Remove Me', data: '' });
    removeWidget(id);
    expect(useWorkspaceStore.getState().widgets).toHaveLength(0);
  });

  it('clears all widgets', () => {
    const { addWidget, clearWidgets } = useWorkspaceStore.getState();
    addWidget({ type: 'notes', title: 'Note 1', data: '' });
    addWidget({ type: 'kanban', title: 'Board', data: [] });
    clearWidgets();
    expect(useWorkspaceStore.getState().widgets).toHaveLength(0);
  });

  it('saves a session', () => {
    const { saveSession } = useWorkspaceStore.getState();
    saveSession('My Session', []);
    expect(useWorkspaceStore.getState().sessions).toHaveLength(1);
    expect(useWorkspaceStore.getState().sessions[0].name).toBe('My Session');
  });

  it('sets sidebar open', () => {
    const { setSidebarOpen } = useWorkspaceStore.getState();
    setSidebarOpen(false);
    expect(useWorkspaceStore.getState().sidebarOpen).toBe(false);
  });
});

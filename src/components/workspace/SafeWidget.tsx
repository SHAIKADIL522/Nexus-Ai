'use client';
import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props { children: ReactNode; widgetName?: string; }
interface State { hasError: boolean; error?: string; }

export default class SafeWidget extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(err: Error): State { return { hasError: true, error: err.message }; }
  override render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="size-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle className="size-5 text-amber-400/70" />
        </div>
        <div>
          <p className="text-xs text-white/40 font-medium mb-1">Widget crashed</p>
          <p className="text-[11px] text-white/20 max-w-[200px] leading-relaxed">{this.state.error}</p>
        </div>
        <button
          onClick={() => this.setState({ hasError: false })}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-all"
        >
          <RotateCcw className="size-3.5" /> Retry
        </button>
      </div>
    );
    return this.props.children;
  }
}

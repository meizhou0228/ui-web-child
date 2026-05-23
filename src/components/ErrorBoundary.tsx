import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: unknown) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-7xl">😢</div>
          <h1 className="text-2xl font-bold">糟糕，出错啦</h1>
          <p className="text-gray-600">{this.state.error.message}</p>
          <button
            onClick={() => location.reload()}
            className="px-6 py-3 bg-sky-brand text-white rounded-big shadow-3d font-bold"
          >刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}

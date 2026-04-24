import React from 'react';

const isChunkLoadError = (error) => {
  const message = `${error?.message || ''} ${error?.name || ''}`;
  return [
    /Failed to fetch dynamically imported module/i,
    /Importing a module script failed/i,
    /Loading chunk [\d]+ failed/i,
    /ChunkLoadError/i
  ].some((pattern) => pattern.test(message));
};

let telemetryModulePromise = null;
let recoveryModulePromise = null;
let stateModulePromise = null;

const loadTelemetry = async () => {
  if (!telemetryModulePromise) {
    telemetryModulePromise = import('../utils/telemetry');
  }
  const module = await telemetryModulePromise;
  return module.default;
};

const loadRecovery = async () => {
  if (!recoveryModulePromise) {
    recoveryModulePromise = import('../utils/appRecovery');
  }
  return recoveryModulePromise;
};

const loadStateSerializer = async () => {
  if (!stateModulePromise) {
    stateModulePromise = import('../utils/stateSerializer');
  }
  return stateModulePromise;
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, rewindPath: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, info) {
    try {
      const [Telemetry, serializer] = await Promise.all([
        loadTelemetry(),
        loadStateSerializer()
      ]);

      Telemetry.critical('[ErrorBoundary] Runtime failure captured', {
        error: error?.message,
        info
      });

      const lastPath = await serializer.restoreInteraction('last_path');
      if (lastPath) {
        this.setState({ rewindPath: lastPath });
      }
    } catch {
      // Keep the fallback stable even if diagnostics fail to load.
    }
  }

  handleLogicalRewind = () => {
    if (this.state.rewindPath) {
      window.location.replace(this.state.rewindPath);
      return;
    }

    this.handleRecovery();
  };

  handleRecovery = async () => {
    const chunkError = isChunkLoadError(this.state.error);

    try {
      const { requestAppRecovery } = await loadRecovery();
      requestAppRecovery({
        reason: chunkError ? 'runtime-chunk' : 'runtime-crash',
        maxReloads: chunkError ? 1 : 0,
        fallbackPath: '/'
      });
    } catch {
      window.location.replace(chunkError ? '/?recover=chunk-safe' : '/?recover=runtime-safe');
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const chunkError = isChunkLoadError(this.state.error);

    return (
      <div className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-white/10 bg-slate-950/85 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:p-10">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.75)]" />
              Runtime recovery mode
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {chunkError ? 'Workspace update interrupted' : 'Application recovery required'}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {chunkError
                  ? 'A code update or cached file mismatch interrupted the current view. We can refresh the workspace safely without losing the whole session.'
                  : 'An unexpected runtime problem interrupted this workspace. You can safely retry the current application state or return to a stable route.'}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Diagnostic summary
              </p>
              <p className="mt-3 break-words rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-3 font-mono text-xs leading-6 text-rose-200">
                {this.state.error?.message || 'Unexpected application failure'}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {this.state.rewindPath && (
                <button
                  type="button"
                  onClick={this.handleLogicalRewind}
                  className="btn-secondary justify-center px-6 py-3"
                >
                  Return to last safe page
                </button>
              )}
              <button
                type="button"
                onClick={this.handleRecovery}
                className="btn-primary justify-center px-6 py-3"
              >
                Reload application
              </button>
              <button
                type="button"
                onClick={() => window.location.replace('/login')}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Go to login
              </button>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <span>VITAM Recovery Shell</span>
              <span>{chunkError ? 'Chunk refresh suggested' : 'Safe runtime recovery active'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center card m-4">
                    <div className="avatar avatar-xl mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                    <p className="max-w-md mx-auto mb-8" style={{ color: 'var(--color-text-muted)' }}>
                        The page encountered an unexpected error. This might be due to a temporary data issue.
                    </p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw size={18} />
                        Reload Page
                    </button>
                    {import.meta.env.DEV && (
                        <div className="mt-8 text-left w-full h-48 overflow-auto p-4 bg-black/30 rounded-xl font-mono text-xs opacity-50">
                            {this.state.error && this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

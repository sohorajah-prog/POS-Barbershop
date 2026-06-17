import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#1f0d0d', color: '#fca5a5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Terjadi Kesalahan (Error)</h1>
          <p style={{ marginBottom: '20px', color: '#f87171' }}>Aplikasi mengalami crash. Berikut adalah detail errornya:</p>
          <details style={{ whiteSpace: 'pre-wrap', backgroundColor: '#451a1a', color: '#fecaca', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '14px' }} open>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>Detail Error (Screenshot ini jika perlu)</summary>
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

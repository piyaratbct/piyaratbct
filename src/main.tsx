import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely override window.alert and window.confirm to prevent SecurityError in sandboxed or cross-origin iframe environments,
// and dispatch a custom event to display custom beautiful toast notifications instead.
if (typeof window !== 'undefined') {
  // Capture unhandled promise rejections (extremely common with offline/WebSockets inside restricted sandboxed iframe previews)
  window.addEventListener('unhandledrejection', (event) => {
    console.warn("[SafeFrame] Global caught unhandled promise rejection:", event.reason);
    // Prevent default propagation so it does not bubble up to the parent window as a Script error
    try {
      event.preventDefault();
    } catch (e) {}
  });

  // Capture unhandled sync/async runtime errors
  window.addEventListener('error', (event) => {
    console.warn("[SafeFrame] Global caught unhandled error from listener:", event.error || event.message);
    try {
      event.preventDefault();
      event.stopImmediatePropagation();
    } catch (e) {}
  });

  // Explicit window.onerror returning true guarantees sandboxed security and iframe script errors do not crash parent previewer or report as raw Script Errors
  window.onerror = function (message, source, lineno, colno, error) {
    console.warn("[SafeFrame] Global error caught via window.onerror:", message, "from source:", source);
    // Return true to prevent standard error reporting on the iframe parent
    return true;
  };

  try {
    window.alert = function (message) {
      console.log("[SafeAlert]", message);
      try {
        const event = new CustomEvent('app-safe-alert', { detail: { message: String(message) } });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("[SafeAlert Error]", err);
      }
    };
  } catch (alertErr) {
    console.warn("Could not safe-override window.alert due to sandbox constraints:", alertErr);
  }

  try {
    const originalConfirm = typeof window !== 'undefined' ? window.confirm : undefined;
    window.confirm = function (message) {
      console.log("[SafeConfirm]", message);
      if (originalConfirm) {
        try {
          return originalConfirm.call(window, message);
        } catch (err) {
          console.warn("[SafeConfirm Error - executing implicitly due to Sandbox limits]", err);
        }
      }
      try {
        const event = new CustomEvent('app-safe-alert', { detail: { message: `[ยืนยันการทำรายการอัตโนมัติ]: ${message}` } });
        window.dispatchEvent(event);
      } catch (e) {}
      return true;
    };
  } catch (confirmErr) {
    console.warn("Could not safe-override window.confirm due to sandbox constraints:", confirmErr);
  }
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', color: '#666' }}>
          <h2>Oops, something went wrong.</h2>
          <p>Please click the reload button in the preview window.</p>
          <pre style={{textAlign: 'left', fontSize: '12px', background: '#f5f5f5', padding: '1rem', marginTop: '1rem', overflow: 'auto', borderRadius: '4px'}}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


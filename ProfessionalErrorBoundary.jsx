/**
 * Professional Error Boundary Component
 * - Captures uncaught errors
 * - Provides recovery mechanisms
 * - User-friendly messaging
 * - Error logging
 * - State restoration
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      previousPages: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error to external service in production
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      message: error.toString(),
      stack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
    };

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.warn('Error logged:', errorLog);
      // Example: sendToSentry(errorLog);
    } else {
      console.error('Error details:', errorLog);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage =
        this.state.error?.message || 'An unexpected error occurred. Please try again.';

      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl border border-red-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h1 className="text-xl font-bold text-white">Oops!</h1>
                  <p className="text-red-100 text-sm">Something went wrong</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-300 mb-4">{errorMessage}</p>

              {isDevelopment && this.state.errorInfo && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-mono text-yellow-400 hover:text-yellow-300 transition-colors">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300 overflow-auto max-h-40 border border-gray-700">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="bg-blue-900/30 border border-blue-500/30 rounded p-3 mb-4">
                <p className="text-xs text-blue-300">
                  <strong>Error Count:</strong> {this.state.errorCount}
                </p>
              </div>

              <p className="text-gray-400 text-xs mb-4">
                We've logged this issue. Try refreshing the page or navigating back.
              </p>
            </div>

            {/* Actions */}
            <div className="bg-gray-900 px-6 py-4 flex flex-col gap-2 border-t border-gray-700">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoBack}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

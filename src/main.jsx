import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import { store } from './store/store.js'
import { Provider } from 'react-redux'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 40, color: 'red', fontWeight: 'bold' }}>Something went wrong: {this.state.error?.message || 'Unknown error'}</div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
    <Provider store={store}>
        <App />
      </Provider>,
    </ErrorBoundary>
  </StrictMode>,
)

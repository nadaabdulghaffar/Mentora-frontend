import React, { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CreateProgramErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CreateProgramModal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Silently fail - don't render anything if modal crashes
      console.warn('CreateProgramModal crashed, hiding modal');
      return null;
    }

    return this.props.children;
  }
}

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>Something went wrong</h1>
                        <p className={styles.message}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className={styles.actions}>
                            <Button onClick={this.handleReset}>Try Again</Button>
                            <Button
                                variant="secondary"
                                onClick={() => (window.location.href = '/')}
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}





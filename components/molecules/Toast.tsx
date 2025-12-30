'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onClose]);

    const Icon = icons[toast.type];

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
            <Icon size={20} className={styles.icon} />
            <span className={styles.message}>{toast.message}</span>
            <button
                className={styles.closeButton}
                onClick={() => onClose(toast.id)}
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
};





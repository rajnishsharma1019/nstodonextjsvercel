'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ToastItem, Toast } from './Toast';
import styles from './ToastContainer.module.css';

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    if (typeof window === 'undefined' || toasts.length === 0) {
        return null;
    }

    return createPortal(
        <div className={styles.container} role="region" aria-live="polite" aria-label="Notifications">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>,
        document.body
    );
};





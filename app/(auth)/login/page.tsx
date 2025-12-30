import React from 'react';
import { LoginForm } from '@/components/organisms/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <LoginForm />
        </div>
    );
}

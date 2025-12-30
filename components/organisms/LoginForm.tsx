'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { api } from '@/lib/api';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Backend expects form-data for login/access-token
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            await api('/login/access-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            // Login successful, cookie set by backend
            router.push('/dashboard');
        } catch (err: any) {
            if (err instanceof Error) {
                setError(err.message || 'Login failed');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to manage your tasks efficiently</p>
            {error && <div className={styles.error}>{error}</div>}

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
            />

            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
            />

            <Button type="submit" disabled={loading} className={`${styles.submitBtn} primary lg`}>
                {loading ? <span className={styles.loading}></span> : 'Login'}
            </Button>

            <p className={styles.footer}>
                Don't have an account? <a href="/signup">Sign up</a>
            </p>
        </form>
    );
};

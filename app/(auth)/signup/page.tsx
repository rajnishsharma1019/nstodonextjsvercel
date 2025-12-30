'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { api } from '@/lib/api';
import styles from '@/components/organisms/LoginForm.module.css'; // Reuse styles
import pageStyles from '../login/page.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api('/users/open', {
                method: 'POST',
                body: JSON.stringify({ email, password, full_name: fullName }),
            });

            // Login automatically or redirect to login?
            // For simplicity, redirect to login
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={pageStyles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Sign Up</h2>
                {error && <div className={styles.error}>{error}</div>}

                <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                />

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
                    placeholder="Create a password"
                />

                <Button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <p className={styles.footer}>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </form>
        </div>
    );
}

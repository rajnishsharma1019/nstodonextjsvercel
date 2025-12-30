'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';
import { TaskItem } from '@/components/molecules/TaskItem';
import { ToastContainer } from '@/components/molecules/ToastContainer';
import { api } from '@/lib/api';
import { APIError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import styles from './TaskDashboard.module.css';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    created_at: string;
    due_date?: string;
}

export const TaskDashboard = () => {
    const router = useRouter();
    const toast = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, pending, overdue, completed
    const [page, setPage] = useState(0); // 0-indexed for skip calculation

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
    const [managerEmail, setManagerEmail] = useState('');

    // New Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDue, setNewTaskDue] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const skip = page * 5;
            const statusParam = filter === 'all' ? '' : `&status=${filter}`;
            const data = await api<Task[]>(`/tasks/?skip=${skip}&limit=5${statusParam}`);
            setTasks(data);
        } catch (err) {
            console.error(err);
            if (APIError.isUnauthorized(err)) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => router.push('/login'), 1500);
            } else if (err instanceof APIError) {
                toast.error(err.message || 'Failed to load tasks');
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        
        try {
            await api('/tasks/', {
                method: 'POST',
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDesc,
                    due_date: newTaskDue || null,
                }),
            });
            toast.success('Task created successfully!');
            setIsModalOpen(false);
            setNewTaskTitle('');
            setNewTaskDesc('');
            setNewTaskDue('');
            fetchTasks();
        } catch (err) {
            if (APIError.isValidationError(err)) {
                // Handle validation errors
                const error = err as APIError;
                if (error.details?.detail && Array.isArray(error.details.detail)) {
                    const fieldErrors: Record<string, string> = {};
                    error.details.detail.forEach((item: any) => {
                        const field = item.loc?.[item.loc.length - 1] || 'field';
                        fieldErrors[field] = item.msg;
                    });
                    setFormErrors(fieldErrors);
                    toast.error('Please fix the validation errors');
                } else {
                    toast.error(error.message || 'Failed to create task');
                }
            } else if (APIError.isUnauthorized(err)) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => router.push('/login'), 1500);
            } else if (err instanceof APIError) {
                toast.error(err.message || 'Failed to create task');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    const initCompleteTask = (id: number) => {
        // Prompt for manager email logic
        setCurrentTaskId(id);
        setIsManagerModalOpen(true);
    };

    const handleConfirmComplete = async () => {
        if (!currentTaskId) return;
        try {
            await api(`/tasks/${currentTaskId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'completed',
                    manager_email: managerEmail || undefined,
                }),
            });
            toast.success('Task completed successfully!');
            setIsManagerModalOpen(false);
            setManagerEmail('');
            setCurrentTaskId(null);
            fetchTasks();
        } catch (err) {
            if (APIError.isUnauthorized(err)) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => router.push('/login'), 1500);
            } else if (err instanceof APIError) {
                toast.error(err.message || 'Failed to complete task');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api(`/tasks/${id}`, { method: 'DELETE' });
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (err) {
            if (APIError.isUnauthorized(err)) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => router.push('/login'), 1500);
            } else if (err instanceof APIError) {
                toast.error(err.message || 'Failed to delete task');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    // Helper to check if overdue (for UI indication, though backend filtering handles the group)
    const isTaskOverdue = (task: Task) => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date() && task.status !== 'completed';
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>My Tasks</h1>
                <Button onClick={() => setIsModalOpen(true)}>New Task</Button>
            </header>

            <div className={styles.filters}>
                {['all', 'new', 'pending', 'overdue', 'completed'].map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                        onClick={() => { setFilter(f); setPage(0); }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.taskList}>
                {loading ? (
                    <p>Loading...</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks found.</p>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onComplete={initCompleteTask}
                            onDelete={handleDeleteTask}
                            isOverdue={isTaskOverdue(task)}
                        />
                    ))
                )}
            </div>

            <div className={styles.pagination}>
                <Button disabled={page === 0} onClick={() => setPage(p => p - 1)} size="sm" variant="secondary">Previous</Button>
                <span>Page {page + 1}</span>
                <Button disabled={tasks.length < 5} onClick={() => setPage(p => p + 1)} size="sm" variant="secondary">Next</Button>
            </div>

            {/* New Task Modal */}
            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setFormErrors({});
                setNewTaskTitle('');
                setNewTaskDesc('');
                setNewTaskDue('');
            }} title="Create New Task">
                <form onSubmit={handleCreateTask}>
                    <Input
                        label="Title"
                        value={newTaskTitle}
                        onChange={e => {
                            setNewTaskTitle(e.target.value);
                            if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
                        }}
                        required
                        error={formErrors.title}
                    />
                    <Input
                        label="Description"
                        value={newTaskDesc}
                        onChange={e => {
                            setNewTaskDesc(e.target.value);
                            if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                        }}
                        error={formErrors.description}
                    />
                    <Input
                        label="Due Date"
                        type="datetime-local"
                        value={newTaskDue}
                        onChange={e => {
                            setNewTaskDue(e.target.value);
                            if (formErrors.due_date) setFormErrors(prev => ({ ...prev, due_date: '' }));
                        }}
                        error={formErrors.due_date}
                    />
                    <div className={styles.modalActions}>
                        <Button type="button" variant="secondary" onClick={() => {
                            setIsModalOpen(false);
                            setFormErrors({});
                            setNewTaskTitle('');
                            setNewTaskDesc('');
                            setNewTaskDue('');
                        }}>Cancel</Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </Modal>

            {/* Manager Notification Modal */}
            <Modal isOpen={isManagerModalOpen} onClose={() => setIsManagerModalOpen(false)} title="Notify Manager?">
                <p>Enter manager email to notify them of completion (optional).</p>
                <Input
                    label="Manager Email"
                    type="email"
                    value={managerEmail}
                    onChange={e => setManagerEmail(e.target.value)}
                    placeholder="manager@example.com"
                />
                <div className={styles.modalActions}>
                    {/* If we strictly REQUIRE manager notification for manager workflow, we can make it required. 
                 User requirement: "Prompt for Manager Email via modal... Trigger email notification on confirmation" 
                 "If notifications are enabled" -> Doesn't say strict requirement for email. 
                 I'll allow empty to skip notification or require it? 
                 Ill assume optional but prompts. */}
                    <Button variant="secondary" onClick={handleConfirmComplete}>Skip & Complete</Button>
                    <Button onClick={handleConfirmComplete} disabled={!managerEmail}>Notify & Complete</Button>
                </div>
            </Modal>

            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </div>
    );
};

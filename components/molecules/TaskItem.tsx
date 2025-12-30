import React from 'react';
import { Flag, Trash2, CheckCircle, Circle } from 'lucide-react';
import styles from './TaskItem.module.css';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    due_date?: string;
    manager_email?: string;
}

interface TaskItemProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    isOverdue?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, isOverdue }) => {
    return (
        <div className={`${styles.item} ${task.status === 'completed' ? styles.completed : ''}`}>
            <div className={styles.left}>
                <button
                    className={styles.statusBtn}
                    onClick={() => onComplete(task.id)}
                    aria-label={task.status === 'completed' ? "Mark as pending" : "Mark as completed"}
                    disabled={task.status === 'completed'}
                >
                    {task.status === 'completed' ? <CheckCircle className={styles.checkIcon} /> : <Circle />}
                </button>
                <div className={styles.content}>
                    <h3 className={styles.title}>{task.title}</h3>
                    {task.description && <p className={styles.description}>{task.description}</p>}
                    {task.due_date && (
                        <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
                            {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue && <Flag className={styles.flagIcon} size={14} />}
                        </span>
                    )}
                </div>
            </div>
            <button
                className={styles.deleteBtn}
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

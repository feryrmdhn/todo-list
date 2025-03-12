
export type Task = {
    id: number | string;
    name: string;
    title: string;
    description: string | null;
    status: "Not started" | "On progress" | "Done" | "Reject";
    createdBy: { username: string };
    assignedTo: { username: string };
    assignedToId?: number;
    updatedAt: Date;
}

export type User = {
    id: string;
    email: string;
    role: string;
}

export type TeamMember = {
    id: string | number;
    username: string;
    email: string;
}

export type TaskData = {
    id: number;
    title: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    createdById: number;
    description: string | null;
    assignedToId: number;
}

export type LogData = {
    id: number;
    tableName: string;
    recordId: number;
    action: string;
    oldData: TaskData | null;
    newData: TaskData | null;
    changedById: number;
    taskId: number | null;
    changedAt: Date | string;
    changedBy: {
        id: number;
        username: string;
        email: string;
    };
}
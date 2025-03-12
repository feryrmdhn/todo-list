
export type Task = {
    id: number | string;
    name: string;
    title: string;
    status: "Not started" | "On progress" | "Done" | "Reject";
    createdBy: { username: string };
    assignedTo: { username: string };
    assignedToId?: { id: number };
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
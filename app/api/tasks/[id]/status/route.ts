import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const options = ["not_started", "on_progress", "done", "reject"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const taskId = parseInt(params.id);
        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (user.role !== "team" || task.assignedToId !== user.id) {
            return NextResponse.json(
                { error: "You do not have permission to update this task's status" },
                { status: 403 }
            );
        }

        const { status } = await request.json();
        if (!options.includes(status)) {
            return NextResponse.json({ error: `Invalid status. Allowed: ${options.join(", ")}` }, { status: 400 });
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ message: "Task status updated successfully", task: updatedTask });
    } catch (error) {
        console.error("🔥 Error updating task status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
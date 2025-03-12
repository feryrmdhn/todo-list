import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (user.role !== "lead") {
            return NextResponse.json(
                { error: "Forbidden: Only leads can assign tasks" },
                { status: 403 }
            )
        }

        const { taskId, assignedToId } = await request.json()

        if (!taskId || !assignedToId) {
            return NextResponse.json(
                { error: "Missing taskId or assignedToId" },
                { status: 400 }
            )
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId }
        })

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            )
        }

        if (task.createdById !== user.id) {
            return NextResponse.json(
                { error: "You do not have permission to assign this task" },
                { status: 403 }
            );
        }

        // Ensure assignedToId is user with role 'team'
        const assignedUser = await prisma.user.findUnique({
            where: { id: assignedToId }
        })

        if (!assignedUser || assignedUser.role !== "team") {
            return NextResponse.json(
                { error: "Invalid assigned user" },
                { status: 400 }
            )
        }

        // Update task with assigned user
        await prisma.task.update({
            where: { id: taskId },
            data: { assignedToId }
        })

        return NextResponse.json({
            message: "Task assigned successfully",
            taskId,
            assignedToId
        })
    } catch (error) {
        console.error("Error assigning task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
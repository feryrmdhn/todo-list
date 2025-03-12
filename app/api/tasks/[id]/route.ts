import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

type Params = {
    id: string;
}

// Get a specific task
export async function GET(_request: NextRequest, { params }: { params: Params }) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const taskId = parseInt(params.id)
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true
                    }
                }
            }
        })

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            )
        }

        // Check permission - only creator (lead) or assignee (team) can view
        if (task.createdById !== user.id && task.assignedToId !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to view this task' },
                { status: 403 }
            )
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const taskId = parseInt(params.id);
        const task = await prisma.task.findUnique({ where: { id: taskId } })

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        const updateData = await request.json()

        if (user.role === "lead") {
            if (task.createdById !== user.id) {
                return NextResponse.json(
                    { error: "You do not have permission to update this task" },
                    { status: 403 }
                )
            }

            if (updateData.assigned_to) {
                const assignedUser = await prisma.user.findUnique({
                    where: { id: updateData.assigned_to },
                })

                if (!assignedUser) {
                    return NextResponse.json({ error: "Assigned user not found" }, { status: 404 })
                }

                if (assignedUser.role !== "team") {
                    return NextResponse.json(
                        { error: "Tasks can only be assigned to team members" },
                        { status: 400 }
                    )
                }
            }
        } else if (user.role === "team") {
            if (task.assignedToId !== user.id) {
                return NextResponse.json(
                    { error: "You do not have permission to update this task" },
                    { status: 403 }
                )
            }

            const allowedFields = ["status", "description"];
            const providedFields = Object.keys(updateData);
            const invalidFields = providedFields.filter((field) => !allowedFields.includes(field))

            if (invalidFields.length > 0) {
                return NextResponse.json(
                    { error: `Team members can only update: ${allowedFields.join(", ")}` },
                    { status: 400 }
                );
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json({
            message: "Task updated successfully",
            task: updatedTask,
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: errorMessage
            },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: NextRequest, context: { params: Params }) {
    try {
        if (!context.params || !context.params?.id) {
            return NextResponse.json(
                { error: 'Missing task ID parameter' },
                { status: 400 }
            )
        }

        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (user.role !== 'lead') {
            return NextResponse.json(
                { error: 'Only leads can delete tasks' },
                { status: 403 }
            )
        }

        const taskId = parseInt(context.params?.id, 10);
        if (isNaN(taskId)) {
            return NextResponse.json(
                { error: 'Invalid task ID format' },
                { status: 400 }
            )
        }

        // Delete with permission check
        try {
            const task = await prisma.task.findUnique({
                where: { id: taskId }
            })

            if (!task) {
                return NextResponse.json(
                    { error: 'Task not found' },
                    { status: 404 }
                )
            }

            if (task.createdById !== user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to delete this task' },
                    { status: 403 }
                )
            }

            await prisma.task.delete({
                where: { id: taskId }
            })

            // Add to Log
            await prisma.auditLog.create({
                data: {
                    tableName: "Task",
                    recordId: task.id,
                    action: "delete",
                    oldData: task,
                    changedById: user.id,
                    changedAt: new Date(),
                },
            })

            return NextResponse.json({
                message: 'Task deleted successfully',
                deletedTaskId: taskId
            })
        } catch (dbError) {
            console.error("Database operation failed:", dbError)
            throw dbError
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: errorMessage
            },
            { status: 500 }
        )
    }
}

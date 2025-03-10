import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

type Params = {
    id: string;
};

// Get a specific task
export async function GET(_: Request, { params }: { params: Params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const taskId = parseInt(params.id);
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
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Check permission - only creator (lead) or assignee (team) can view
        if (task.created_by !== user.id && task.assigned_to !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to view this task' },
                { status: 403 }
            );
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Update a task
export async function PUT(request: Request, { params }: { params: Params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const taskId = parseInt(params.id);
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        const updateData = await request.json();

        // Check permissions based on role
        if (user.role === 'lead') {
            // Leads can update all task fields if they created the task
            if (task.created_by !== user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to update this task' },
                    { status: 403 }
                );
            }

            // Validate assigned_to if provided
            if (updateData.assigned_to) {
                const assignedUser = await prisma.user.findUnique({
                    where: { id: updateData.assigned_to }
                });

                if (!assignedUser) {
                    return NextResponse.json(
                        { error: 'Assigned user not found' },
                        { status: 404 }
                    );
                }

                if (assignedUser.role !== 'team') {
                    return NextResponse.json(
                        { error: 'Tasks can only be assigned to team members' },
                        { status: 400 }
                    );
                }
            }
        } else if (user.role === 'team') {
            // Team members can only update status and description if assigned to them
            if (task.assigned_to !== user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to update this task' },
                    { status: 403 }
                );
            }

            // Team members can only update status and description
            const allowedFields = ['status', 'description'];
            const providedFields = Object.keys(updateData);

            const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
            if (invalidFields.length > 0) {
                return NextResponse.json(
                    { error: `Team members can only update: ${allowedFields.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        // Update the task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...updateData,
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Delete a task (lead only)
export async function DELETE(request: Request, { params }: { params: Params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only leads can delete tasks
        if (user.role !== 'lead') {
            return NextResponse.json(
                { error: 'Only leads can delete tasks' },
                { status: 403 }
            );
        }

        const taskId = parseInt(params.id);
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Check if the lead created this task
        if (task.created_by !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to delete this task' },
                { status: 403 }
            );
        }

        // Delete the task
        await prisma.task.delete({
            where: { id: taskId }
        });

        return NextResponse.json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
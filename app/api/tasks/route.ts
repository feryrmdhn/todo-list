import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// Get all tasks (filtered by role)
export async function GET() {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        let tasks;
        if (user.role === 'lead') {
            tasks = await prisma.task.findMany({
                where: { createdById: user.id },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        } else {
            tasks = await prisma.task.findMany({
                where: { assignedToId: user.id },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        }

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (user.role !== 'lead') {
            return NextResponse.json(
                { error: 'Only leads can create tasks' },
                { status: 403 }
            )
        }

        const { title, description, assigned_to } = await request.json()

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // If assigning to someone, make sure they exist and are a team member
        let assignedUser = null;
        if (assigned_to) {
            assignedUser = await prisma.user.findUnique({
                where: { id: assigned_to }
            })

            if (!assignedUser) {
                return NextResponse.json(
                    { error: 'Assigned user not found' },
                    { status: 404 }
                )
            }

            if (assignedUser.role !== 'team') {
                return NextResponse.json(
                    { error: 'Tasks can only be assigned to team members' },
                    { status: 400 }
                )
            }
        }

        // Create the task
        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                status: 'not_started',
                createdById: user.id,
                assignedToId: assigned_to || null
            }
        })

        // Add to Log
        await prisma.auditLog.create({
            data: {
                tableName: "Task",
                recordId: newTask.id,
                action: "insert",
                newData: newTask,
                changedById: user.id,
                changedAt: new Date(),
            },
        })

        return NextResponse.json(
            {
                message: 'Task created successfully',
                task: newTask
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating task:', error)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
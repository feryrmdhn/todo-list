import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser()

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

        const { searchParams } = new URL(request.url)
        const tableName = searchParams.get("tableName") || undefined

        const logs = await prisma.auditLog.findMany({
            where: tableName ? { tableName: { contains: tableName, mode: "insensitive" } } : {},
            orderBy: { changedAt: "desc" },
            include: {
                changedBy: { select: { id: true, username: true, email: true } },
                task: { select: { id: true, title: true } }
            }
        })

        return NextResponse.json({ data: logs })
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch audit logs" },
            { status: 500 }
        )
    }
}

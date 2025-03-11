import { getAuthUser } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { NextResponse } from "next/server";

export async function GET() {
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
                { error: "Only lead can view team members" },
                { status: 403 }
            )
        }

        // Get all user with role 'team'
        const teamMembers = await prisma.user.findMany({
            where: { role: "team" },
            select: {
                id: true,
                username: true,
                email: true
            }
        })

        return NextResponse.json(teamMembers)

    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

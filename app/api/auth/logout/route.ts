import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies()

        cookieStore.set({
            name: "auth_token",
            value: "",
            path: "/",
            httpOnly: true,
            maxAge: 0,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })

        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Logout error:", error)
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
    }
}
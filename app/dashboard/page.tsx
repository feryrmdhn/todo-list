'use client'

import { useRouter } from "next/navigation";
import TodoList from "./components/Body";
import { formatDate } from "@/utils";

export default function Dashboard() {
    const router = useRouter()

    const today = new Date()
    const formattedDate = formatDate(today)

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
    }

    return (
        <>
            <div className="mt-3 mx-auto max-w-2xl flex justify-between px-3 sm:px-0">
                <p className="leading-10">{formattedDate}</p>
                <button
                    onClick={handleLogout}
                    className="py-2 px-3 text-white bg-red-500 hover:bg-red-600 rounded cursor-pointer"
                >
                    Logout
                </button>
            </div>

            <div className="px-3 sm:px-0">
                <TodoList />
            </div>
        </>
    )
}
'use client'

import { useRouter } from "next/navigation";
import { formatDate } from "@/utils";
import BodyTodo from "./components/Body";
import axios from "axios";

export default function Dashboard() {
    const router = useRouter()

    const today = new Date()
    const formattedDate = formatDate(today)

    const handleLogout = async () => {
        try {
            await axios.post("/api/auth/logout", {}, { withCredentials: true })
            localStorage.removeItem('userData')
            router.replace("/login")
        } catch (err) {
            console.log(err)
        }
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
                <BodyTodo />
            </div>
        </>
    )
}
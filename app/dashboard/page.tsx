'use client'

import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
        >
            Logout
        </button>
    )
}
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User } from "@/types";

const useAuth = () => {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        try {
            const userData = localStorage.getItem("userData")
            if (userData) {
                setUser(JSON.parse(userData))
            }
        } catch (err) {
            console.error("Error reading localStorage:", err)
        }
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError("")

        try {
            const res = await axios.post("/api/auth/login",
                { email, password },
                { withCredentials: true }
            )

            localStorage.setItem('userData', JSON.stringify(res.data.user))
            router.push("/dashboard")
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Login failed");
            }
        }
        finally {
            setLoading(false)
        }
    }

    return { user, login, loading, error }
}

export default useAuth;

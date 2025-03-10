"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("team");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to register");
                setLoading(false);
                return;
            }

            router.push("/login");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700">Register</h2>

                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <form className="mt-4" onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="lead"
                                    checked={role === "lead"}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mr-2"
                                />
                                Lead
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="team"
                                    checked={role === "team"}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mr-2"
                                />
                                Team
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!username || !email || !password || loading}
                        className={`cursor-pointer w-full p-2 text-white rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-500">
                    Already have an account ?{" "}
                    <a href="/login" className="text-blue-500 hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}
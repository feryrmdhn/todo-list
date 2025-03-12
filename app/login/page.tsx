'use client'

import { useState } from 'react';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
    const { login, error: authError, loading: authLoading } = useAuth()
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        await login(email, password)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>

                {authError && <p className="text-red-500 text-sm text-center mt-2">{authError}</p>}

                <form className="mt-4" onSubmit={handleLogin}>
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

                    <button
                        type="submit"
                        disabled={!email || !password || authLoading}
                        className={`cursor-pointer w-full p-2 text-white rounded-lg ${authLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {authLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-500">
                    Don&rsquo;t have an account yet ?{" "}
                    <a href="/register" className="text-blue-500 hover:underline">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    )
}

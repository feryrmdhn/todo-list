'use client'

import useAuth from "@/app/hooks/useAuth";
import { Task, TeamMember } from "@/types";
import { STATUS_OPTIONS, formattedText } from "@/utils";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import LogsLayout from "./Logs";

const BodyTodo: FC = () => {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<Array<Task>>([])
    const [newTask, setNewTask] = useState<string>("")
    const [members, setMembers] = useState<Array<TeamMember>>([])
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [reFetch, setReFetch] = useState<boolean>(false)
    const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false)
    const [isLoadingGetUser, setIsLoadingGetUser] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [showLog, setShowLog] = useState<boolean>(false)

    const fetchTasks = async () => {
        setIsLoadingFetch(true)
        try {
            const { data } = await axios.get("/api/tasks")
            setTasks(data)
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        }
        finally {
            setReFetch(false)
            setIsLoadingFetch(false)
        }
    }

    const fetchUserTeam = async () => {
        setIsLoadingGetUser(true)
        try {
            const { data } = await axios.get("/api/users")
            setMembers(data)
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
                setMembers([])
            }
        }
        finally {
            setIsLoadingGetUser(false)
        }
    }

    const addTask = async () => {
        if (!newTask) return;
        try {
            await axios.post("/api/tasks",
                { title: newTask },
                { headers: { "Content-Type": "application/json" } }
            )

            setReFetch(true)
            setErrorMessage("")
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        }
        finally {
            setNewTask("")
        }
    }

    const assignTask = async (taskId: number | string, assignedToId: number | string) => {
        try {
            await axios.post("/api/tasks/assign",
                { taskId, assignedToId },
                { headers: { "Content-Type": "application/json" } }
            )

            setErrorMessage("")

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        }
    }

    const updateTask = async () => {
        if (!editingTask) return;
        try {
            const res = await axios.put(`/api/tasks/${editingTask.id}`,
                { title: editingTask.title },
                { headers: { "Content-Type": "application/json" } }
            )

            if (res.status === 200) {
                setTasks(tasks.map((t) => (t.id === editingTask.id ? editingTask : t)))
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        } finally {
            setEditingTask(null)
            setIsEdit(false)
        }
    }

    const deleteTask = async (id: number) => {
        try {
            await axios.delete(`/api/tasks/${id}`)
            setReFetch(true)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        }
    }

    const updateStatus = async (id: string, status: Task["status"]) => {
        try {
            await axios.patch(`/api/tasks/${id}/status`,
                { status },
                { headers: { "Content-Type": "application/json" } }
            )
            setReFetch(true)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error)
            }
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [reFetch])

    useEffect(() => {
        if (!isEdit) fetchTasks()
    }, [isEdit])

    const editTask = (task: Task) => {
        fetchUserTeam()
        setEditingTask(task)
    }

    return (
        <>
            {!isEdit &&
                <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
                    <div className="flex justify-between mb-1">
                        <h1 className="text-2xl font-bold text-gray-500 mb-4">Todo List</h1>
                        {user?.role === 'lead' &&
                            <button
                                onClick={() => setShowLog(true)}
                                className="flex items-center py-1 px-2 text-blue-500 cursor-pointer rounded"
                            >
                                View Logs &nbsp;
                                <span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4 text-blue-500"
                                    >
                                        <path d="M14 3h7v7" />
                                        <path d="M10 14 21 3" />
                                        <path d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    </svg>
                                </span>
                            </button>
                        }
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Input task title here.."
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded text-gray-500 focus:outline-none"
                        />
                        <button
                            onClick={addTask}
                            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 rounded"
                        >
                            Add
                        </button>
                    </div>
                    {errorMessage && <p className="text-red-500 text-base mb-1">{errorMessage}</p>}

                    {isLoadingFetch ?
                        <p className="text-base text-center text-gray-400">Loading...</p>
                        :
                        <ul>
                            {tasks.map((task) => (
                                <li key={task.id} className="flex justify-between p-2 border-b flex-col lg:flex-row">
                                    <div>
                                        <p className="font-semibold text-gray-400">{task.title}</p>

                                        {task.assignedTo && (
                                            <p className="text-sm text-teal-600">
                                                Assigned to: {task.assignedTo.username}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-x-4 mt-2 lg:mt-0">
                                        {user?.role === 'lead' ?
                                            <p className="text-gray-400">{formattedText(task.status)} | </p>
                                            :
                                            <select
                                                className="border rounded p-1 focus:outline-none text-gray-400"
                                                value={task.status}
                                                onChange={(e) => updateStatus(task.id.toString(), e.target.value as Task["status"])}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                        }

                                        {user?.role === 'lead' &&
                                            <>
                                                <button
                                                    onClick={() => {
                                                        editTask(task)
                                                        setIsEdit(true)
                                                    }}
                                                    className="text-blue-500 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        deleteTask(task.id as number)
                                                        setIsEdit(false)
                                                    }}
                                                    className="text-red-500 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        }
                                    </div>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            }

            {/* Modal Edit Task */}
            {isEdit && editingTask && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 mx-2 lg:mx-0">
                    <div className="bg-white p-6 rounded shadow-lg w-xl">
                        <h2 className="text-xl font-bold text-gray-400 mb-4">Edit Task</h2>
                        <label className="text-sm text-gray-500">Task Title</label>
                        <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="border text-gray-400 p-2 w-full mb-2 rounded focus:outline-none"
                        />

                        {isLoadingGetUser ?
                            <p className="text-gray-400">Loading...</p>
                            :
                            (members.length === 0 ?
                                <p className="text-gray-400">Empty user</p>
                                :
                                <>
                                    <label className="text-sm text-gray-500">Member</label>
                                    <select
                                        className="border rounded px-1 py-3 focus:outline-none text-gray-400 w-full"
                                        value={editingTask.assignedToId?.toString() || ""}
                                        onChange={async (e) => {
                                            const newAssignedToId = Number(e.target.value);
                                            const selectedMember = members.find(m => m.id === newAssignedToId);

                                            setEditingTask((prev) => {
                                                if (!prev) return null;
                                                return {
                                                    ...prev,
                                                    assignedToId: newAssignedToId,
                                                    assignedTo: selectedMember ? {
                                                        id: selectedMember.id,
                                                        username: selectedMember.username
                                                    } : { username: "" }
                                                }
                                            })

                                            if (editingTask?.id) {
                                                await assignTask(editingTask.id, newAssignedToId);
                                            }
                                        }}
                                    >
                                        {members.map((data) => (
                                            <option key={data.id} value={data.id}>
                                                {data.username}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )
                        }

                        <div className="mt-4 flex gap-x-2">
                            <button
                                onClick={updateTask}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditingTask(null)
                                    setIsEdit(false)
                                }}
                                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLog &&
                <LogsLayout onClose={() => setShowLog(false)} />
            }
        </>
    )
}

export default BodyTodo;


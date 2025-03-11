'use client'

import { Task, TeamMember } from "@/types";
import { STATUS_OPTIONS } from "@/utils";
import { useEffect, useState } from "react";

export default function TodoList() {
    const [tasks, setTasks] = useState<Array<Task>>([])
    const [newTask, setNewTask] = useState<string>("")
    const [members, setMembers] = useState<Array<TeamMember>>([])
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [reFetch, setReFetch] = useState<boolean>(false)
    const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)

    const fetchTasks = async () => {
        setIsLoadingFetch(true)
        try {
            const res = await fetch("/api/tasks")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setTasks(data);
        }
        catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }
        finally {
            setReFetch(false)
            setIsLoadingFetch(false)
        }
    }

    const fetchUserTeam = async () => {
        try {
            const res = await fetch("/api/users")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setMembers(data);
        }
        catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [reFetch])

    useEffect(() => {
        if (!isEdit) fetchTasks()
    }, [isEdit])

    // Add Task
    const addTask = async () => {
        if (!newTask) return;
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTask }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error)
            };

            setNewTask("");
            setReFetch(true)
            setErrorMessage("")
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }
    };

    // Assign Task
    const assignTask = async (taskId: number | string, assignedToId: number | string) => {
        try {
            const res = await fetch("/api/tasks/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, assignedToId }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error)
            };

            setErrorMessage("")

        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }
    };

    // Update Task (Lead only)
    const updateTask = async () => {
        if (!editingTask) return;
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: editingTask.title }),
        });
        if (res.ok) {
            setTasks(tasks.map((t) => (t.id === editingTask.id ? editingTask : t)));
            setEditingTask(null);
        }
    };

    // Delete Task (Lead only)
    const deleteTask = async (id: number) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
            if (res.ok) setReFetch(true);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // Update Status (Team only)
    const updateStatus = async (id: string, status: Task["status"]) => {
        try {
            const res = await fetch(`/api/tasks/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) setReFetch(true)
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }
    };

    const editTask = (task: Task) => {
        fetchUserTeam()
        setEditingTask(task)
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-gray-500 mb-4">Todo List</h1>

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
            {errorMessage && <p className="text-red-500 text-base">{errorMessage}</p>}

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
                            </div>
                        </li>
                    ))}
                </ul>
            }

            {/* Modal Edit Task */}
            {isEdit && editingTask && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white p-6 rounded shadow-lg w-xl">
                        <h2 className="text-xl font-bold text-gray-400">Edit Task</h2>
                        <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) =>
                                setEditingTask({ ...editingTask, title: e.target.value })
                            }
                            className="border text-gray-400 p-2 w-full my-2 rounded focus:outline-none"
                        />

                        {members.length === 0 ?
                            <p className="text-gray-400">Empty user</p>
                            :
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
                                            } : {}
                                        };
                                    });

                                    // Send the API call
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
                        }

                        <div className="mt-4 flex gap-x-2">
                            <button
                                onClick={updateTask}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingTask(null)}
                                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


'use client'

import { LogData } from "@/types";
import { formattedText } from "@/utils";
import axios from "axios";
import { FC, useEffect, useState } from "react"

interface Props {
    onClose: (_value: boolean) => void;
}

const LogsLayout: FC<Props> = ({ onClose }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [dataLogs, setDataLogs] = useState<Array<LogData>>([])

    const fetchLogs = async () => {
        setLoading(true)

        try {
            const res = await axios.get("/api/log")
            setDataLogs(res.data?.data)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.log(err.response?.data?.error)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-30">
            <div className="bg-white p-6 rounded shadow-md w-xl border">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-gray-500">Logs</h2>
                    <button className="cursor-pointer text-gray-500" onClick={() => onClose(false)}>X</button>
                </div>
                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    <div className="h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {dataLogs.map((item) => (
                            <div key={item.id} className="p-2 border-b">
                                <p className="text-blue-500">{item.changedBy?.username}</p>
                                <p className="text-gray-500">Task id: {item.newData?.id || item.oldData?.id}</p>
                                <div className="flex justify-between flex-wrap">
                                    <div className="flex items-center gap-x-2">
                                        {item.oldData && (
                                            <p className="text-red-500">
                                                {item.oldData.title}
                                            </p>
                                        )}
                                        {item.oldData && item.newData && <div className="text-black">&rarr;</div>}
                                        <p className="text-green-600">{item.newData?.title}</p>
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        {item.oldData && (
                                            <p className="text-red-500">
                                                {formattedText(item.oldData.status)}
                                            </p>
                                        )}
                                        {item.oldData && item.newData && <div className="text-black">&rarr;</div>}
                                        <p className="text-green-600">{formattedText(item.newData?.status as string)}</p>
                                    </div>
                                    <p className="text-gray-500">{item.action.toUpperCase()}</p>
                                </div>
                                <p className="text-sm text-gray-400">{new Date(item.changedAt).toLocaleString()}</p>
                            </div>
                        ))
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default LogsLayout;
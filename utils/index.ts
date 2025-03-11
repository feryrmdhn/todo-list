
export const STATUS_OPTIONS = [
    { label: "Not started", value: "not_started" },
    { label: "On progress", value: "on_progress" },
    { label: "Done", value: "done" },
    { label: "Reject", value: "reject" }
]

export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return date.toLocaleDateString('en-US', options).replace(/(\d+)(st|nd|rd|th)/, "$1")
}


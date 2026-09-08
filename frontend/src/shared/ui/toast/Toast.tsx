import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ToastProps = {
    message: string | null
    duration?: number
    onDismiss?: () => void
}

export function Toast({message, duration = 3000, onDismiss}: ToastProps) {
    useEffect(() => {
        if (!message || !onDismiss) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            onDismiss()
        }, duration)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [message, duration, onDismiss])

    if (!message) {
        return null
    }

    return createPortal(
        <div
            className="toast show"
            role="status"
            aria-live="polite"
        >
            {message}
        </div>,
        document.body,
    )
}
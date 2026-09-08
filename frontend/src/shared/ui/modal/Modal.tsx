import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
    title: string
    subtitle?: string
    children: ReactNode
    onClose: () => void
}

export function Modal({title, subtitle, children, onClose}: ModalProps) {
    const titleId = useId()
    const subtitleId = useId()

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [onClose])

    return createPortal(
        <div
            className="modal-backdrop show"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={subtitle ? subtitleId : undefined}
            >
                <div className="modal-head">
                    <div>
                        <h2 className="modal-title" id={titleId}>
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="modal-subtitle" id={subtitleId}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        className="icon-btn"
                        type="button"
                        aria-label="Закрыть модальное окно"
                        onClick={onClose}
                    >
                        <X size={17} />
                    </button>
                </div>

                {children}
            </section>
        </div>,
        document.body,
    )
}
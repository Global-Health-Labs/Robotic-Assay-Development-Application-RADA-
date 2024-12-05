import React from 'react'

interface DialogModalProps {
  isOpen: boolean
  title: string
  message: string
  onCancel: () => void
  onContinue: () => void
}

const DialogModal: React.FC<DialogModalProps> = ({
  isOpen,
  title,
  message,
  onCancel,
  onContinue,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default DialogModal

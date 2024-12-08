import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogModal

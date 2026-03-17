'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this address?')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Address deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete address')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-sm font-medium disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}

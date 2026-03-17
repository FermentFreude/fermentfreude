import { Card } from '@/components/ui/card'
import { Star, Plus } from 'lucide-react'

export const metadata = {
  title: 'Reviews - FermentFreude',
  description: 'Your product reviews',
}

export default function ReviewsPage() {
  const reviews: unknown[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Your Reviews</h1>
        <p className="text-[#4b4f4a]">Share your feedback on products you&apos;ve purchased</p>
      </div>

      {/* Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id} className="p-6 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#4b4b4b]">{review.productName}</h3>
                <span className="text-xs text-[#4b4f4a]">{review.date}</span>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-[#e6be68] text-[#e6be68]' : 'text-[#e6be68]/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[#4b4f4a]">{review.comment}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-[#f0ede6]">
                <button className="text-sm text-[#e6be68] hover:text-[#d4a85a]">Edit</button>
                <span className="text-[#e6be68]">•</span>
                <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <Star className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No reviews yet</p>
          <p className="text-sm text-[#4b4f4a] mb-6">Share your experience with products you&apos;ve purchased</p>
          <button className="inline-flex items-center gap-2 px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Write Your First Review
          </button>
        </Card>
      )}
    </div>
  )
}

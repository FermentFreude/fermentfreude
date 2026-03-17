import { Card } from '@/components/ui/card'
import { Download, FileText } from 'lucide-react'

export const metadata = {
  title: 'Downloads - FermentFreude',
  description: 'Your digital downloads',
}

export default function DownloadsPage() {
  const downloads: unknown[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Downloads</h1>
        <p className="text-[#4b4f4a]">Access your purchased digital products and files</p>
      </div>

      {/* Downloads */}
      {downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map((download: any) => (
            <Card key={download.id} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <FileText className="w-10 h-10 text-[#e6be68] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#4b4b4b] mb-1">{download.name}</h3>
                    <p className="text-sm text-[#4b4f4a]">{download.description}</p>
                    <p className="text-xs text-[#4b4f4a] mt-2">Purchased: {download.purchasedDate}</p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-[#e6be68] hover:bg-[#f9f0dc] rounded transition-colors font-medium">
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <Download className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No downloads available</p>
          <p className="text-sm text-[#4b4f4a]">When you purchase digital products, they'll appear here</p>
        </Card>
      )}
    </div>
  )
}

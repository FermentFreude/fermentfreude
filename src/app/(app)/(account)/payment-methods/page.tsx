import { Card } from '@/components/ui/card'
import { CreditCard, Plus } from 'lucide-react'

export const metadata = {
  title: 'Payment Methods - FermentFreude',
  description: 'Manage your payment methods',
}

export default function PaymentMethodsPage() {
  const paymentMethods: unknown[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Payment Methods</h1>
          <p className="text-[#4b4f4a]">Manage your saved payment cards</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Add Card
        </button>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method: any) => (
            <Card key={method.id} className="p-6 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <CreditCard className="w-6 h-6 text-[#e6be68]" />
                {method.isDefault && (
                  <span className="text-xs bg-[#e6be68] text-white px-2 py-1 rounded">Default</span>
                )}
              </div>
              <p className="font-medium text-[#4b4b4b] mb-2">{method.cardType}</p>
              <p className="text-sm text-[#4b4f4a] mb-4">**** **** **** {method.lastFour}</p>
              <div className="flex gap-2">
                <button className="text-sm text-[#e6be68] hover:text-[#d4a85a]">Edit</button>
                <span className="text-[#e6be68]">•</span>
                <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <CreditCard className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No payment methods saved</p>
          <p className="text-sm text-[#4b4f4a] mb-6">Add a payment method for faster checkout</p>
          <button className="inline-flex items-center gap-2 px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Add Payment Method
          </button>
        </Card>
      )}
    </div>
  )
}

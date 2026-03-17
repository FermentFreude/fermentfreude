import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Shipping Methods - FermentFreude',
  description: 'Available shipping methods',
}

export default function ShippingMethodsPage() {
  const shippingMethods = [
    {
      id: 1,
      name: 'Standard Shipping',
      description: 'Delivery within 5-7 business days',
      price: 0,
      isDefault: true,
    },
    {
      id: 2,
      name: 'Express Shipping',
      description: 'Delivery within 2-3 business days',
      price: 9.99,
      isDefault: false,
    },
    {
      id: 3,
      name: 'Overnight Shipping',
      description: 'Next day delivery',
      price: 24.99,
      isDefault: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Shipping Methods</h1>
        <p className="text-[#4b4f4a]">Choose your preferred shipping method at checkout</p>
      </div>

      {/* Info Box */}
      <Card className="p-4 border-0 shadow-sm bg-blue-50 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Shipping methods are selected during checkout</p>
          <p className=" mt-1">Rates and availability depend on your location and order details</p>
        </div>
      </Card>

      {/* Shipping Methods */}
      <div className="space-y-4">
        {shippingMethods.map((method) => (
          <Card
            key={method.id}
            className={`p-6 border-2 cursor-pointer transition-all ${
              method.isDefault
                ? 'border-[#e6be68] bg-[#f9f0dc]'
                : 'border-[#e6be68]/20 hover:border-[#e6be68]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-5 h-5 rounded-full border-2 border-[#e6be68] mt-1 flex items-center justify-center shrink-0">
                  {method.isDefault && <div className="w-2.5 h-2.5 rounded-full bg-[#e6be68]" />}
                </div>
                <div>
                  <h3 className="font-semibold text-[#4b4b4b]">{method.name}</h3>
                  <p className="text-sm text-[#4b4f4a] mt-1">{method.description}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-[#4b4b4b]">
                  {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                </p>
                {method.isDefault && (
                  <span className="text-xs text-[#e6be68] font-medium">Recommended</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Shipping Information</h2>
        <div className="space-y-3 text-sm text-[#4b4f4a]">
          <p>• Delivery estimates are based on business days, excluding weekends and holidays</p>
          <p>• International shipping may have additional customs clearance time</p>
          <p>• Tracking information will be provided via email after your order ships</p>
          <p>• For time-sensitive orders, select Express or Overnight Shipping</p>
        </div>
      </Card>
    </div>
  )
}

import { AlertCircle, Phone, Clock, CreditCard } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import Button from '@/shared/ui/Button'

interface SubscriptionLockoutProps {
  onRetry: () => void
}

export default function SubscriptionLockout({ onRetry }: SubscriptionLockoutProps) {
  const { org } = useAuth()

  const momoCode = org?.momopay_merchant_code || 'XXXXXX'
  const paymentPhone = org?.payment_phone || '+250 788 XXX XXX'
  const monthlyFee = 30000

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Subscription Expired</h1>
            <p className="text-white/80 mt-2 text-sm">Your access has been paused</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-brand-600">
                Your {org?.account_status === 'trial' ? '14-day trial' : 'subscription'} has ended.
                To continue seamlessly registering clients and staying compliant with MINIJUST,
                please renew your subscription.
              </p>
            </div>

            {/* Payment details */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-5 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-600">Monthly Subscription</span>
                <span className="text-2xl font-bold text-brand-900">{monthlyFee.toLocaleString()} RWF</span>
              </div>

              <div className="border-t border-blue-100 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-500">MTN MomoPay Code</p>
                    <p className="text-lg font-bold text-brand-900 font-mono">*182*8*1*{momoCode}#</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-500">Send receipt via WhatsApp</p>
                    <p className="text-sm font-semibold text-brand-900">{paymentPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-brand-600">
                  <p className="font-semibold mb-1">Quick Reactivation</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Pay via MomoPay code above</li>
                    <li>Send payment screenshot on WhatsApp</li>
                    <li>Access restored instantly</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button onClick={onRetry} variant="primary" className="w-full">
              I've Made Payment - Retry
            </Button>

            <p className="text-center text-xs text-brand-400">
              Questions? Call {paymentPhone}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-brand-400">
            DONE - Digital Notary Platform for Rwanda
          </p>
          <p className="text-[10px] text-brand-300">
            Compliant with MINIJUST regulations & Law Nº 18/2010
          </p>
        </div>
      </div>
    </div>
  )
}

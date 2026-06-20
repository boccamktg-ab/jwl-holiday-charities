import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/jwl-logo.png" alt="Junior Welfare League" width={100} height={100} className="object-contain" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Holiday Charities</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
            WallPay
          </h1>
          <p className="text-xl text-gray-400">
            Lock Screen Ads Platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Brand Portal Card */}
          <Link href="/brand/login" className="group">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 hover:border-[#FBBF24] transition-all duration-300 h-full">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FBBF24] to-[#F97316] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-[#FBBF24] transition-colors">
                  Brand Portal
                </h2>
                <p className="text-gray-400 mb-4">
                  Upload wallpapers, track performance, and view analytics in real-time.
                </p>
              </div>
              <div className="flex items-center text-[#FBBF24] font-medium">
                Login as Brand
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Superadmin Dashboard Card */}
          <Link href="/admin/login" className="group">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 hover:border-[#F97316] transition-all duration-300 h-full">
              <div className="mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#F97316] to-[#DC2626] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-[#F97316] transition-colors">
                  Superadmin Dashboard
                </h2>
                <p className="text-gray-400 mb-4">
                  Approve wallpapers, schedule daily lineups, and view global analytics.
                </p>
              </div>
              <div className="flex items-center text-[#F97316] font-medium">
                Login as Admin
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Premium wallpapers for lock screens • Real-time analytics • Daily rotation</p>
        </div>
      </div>
    </div>
  )
}

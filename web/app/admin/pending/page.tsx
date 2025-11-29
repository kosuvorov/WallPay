'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface PendingWallpaper {
    id: string
    brand_name: string
    title: string
    description: string
    image_url_1242: string
    created_at: string
}

export default function AdminPendingPage() {
    const [user, setUser] = useState<any>(null)
    const [wallpapers, setWallpapers] = useState<PendingWallpaper[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/admin/login')
                return
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userData?.role !== 'superadmin') {
                router.push('/admin/login')
                return
            }

            setUser(user)
            loadPending()
        }

        checkAuth()
    }, [router, supabase])

    async function loadPending() {
        setLoading(true)
        const { data, error } = await supabase
            .from('wallpapers')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })

        if (!error && data) {
            setWallpapers(data)
        }
        setLoading(false)
    }

    async function handleApprove(id: string) {
        const { error } = await supabase
            .from('wallpapers')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.id,
            })
            .eq('id', id)

        if (!error) {
            loadPending()
        }
    }

    async function handleReject(id: string) {
        const { error } = await supabase
            .from('wallpapers')
            .update({ status: 'rejected' })
            .eq('id', id)

        if (!error) {
            loadPending()
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[#F97316] to-[#DC2626] bg-clip-text text-transparent">
                        WallPay Admin
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/admin/schedule" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] transition-colors">
                            Schedule
                        </Link>
                        <Link href="/admin/analytics" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] transition-colors">
                            Analytics
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Pending Wallpapers</h1>
                    <p className="text-gray-400 mb-6">Review and approve wallpapers for publication</p>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading...</div>
                    ) : wallpapers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No pending wallpapers to review
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wallpapers.map((wallpaper) => (
                                <div
                                    key={wallpaper.id}
                                    className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden"
                                >
                                    <div className="relative aspect-[9/19.5]">
                                        <Image
                                            src={wallpaper.image_url_1242}
                                            alt={wallpaper.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-[#F97316] font-medium mb-1">
                                            {wallpaper.brand_name}
                                        </div>
                                        <h3 className="font-bold mb-1">{wallpaper.title}</h3>
                                        {wallpaper.description && (
                                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                                {wallpaper.description}
                                            </p>
                                        )}
                                        <div className="text-xs text-gray-500 mb-4">
                                            {new Date(wallpaper.created_at).toLocaleDateString()}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleApprove(wallpaper.id)}
                                                className="py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(wallpaper.id)}
                                                className="py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

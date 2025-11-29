'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface Wallpaper {
    id: string
    title: string
    description: string
    image_url_1242: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

interface Stats {
    date: string
    count: number
}

export default function BrandWallpapersPage() {
    const [user, setUser] = useState<any>(null)
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
    const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null)
    const [stats, setStats] = useState<Stats[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/brand/login')
                return
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userData?.role !== 'brand') {
                router.push('/brand/login')
                return
            }

            setUser(user)
            loadWallpapers(user.id)
        }

        checkAuth()
    }, [router, supabase])

    async function loadWallpapers(userId: string) {
        setLoading(true)
        const { data, error } = await supabase
            .from('wallpapers')
            .select('*')
            .eq('brand_id', userId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setWallpapers(data)
        }
        setLoading(false)
    }

    async function loadStats(wallpaperId: string) {
        const { data, error } = await supabase
            .rpc('get_wallpaper_stats', { wallpaper_uuid: wallpaperId, days_back: 30 })

        if (!error && data) {
            setStats(data)
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/brand/login')
    }

    useEffect(() => {
        if (selectedWallpaper) {
            loadStats(selectedWallpaper)

            // Subscribe to real-time updates
            const channel = supabase
                .channel(`wallpaper_${selectedWallpaper}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'analytics_events',
                    filter: `wallpaper_id=eq.${selectedWallpaper}`,
                }, () => {
                    loadStats(selectedWallpaper)
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [selectedWallpaper, supabase])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'rejected':
                return 'bg-red-500/10 text-red-400 border-red-500/20'
            default:
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }
    }

    const getTotalSets = (wallpaperId: string) => {
        if (selectedWallpaper === wallpaperId && stats.length > 0) {
            return stats.reduce((sum, stat) => sum + Number(stat.count), 0)
        }
        return 0
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                        WallPay
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/brand/upload" className="px-4 py-2 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-black font-medium rounded-lg hover:opacity-90 transition-opacity">
                            Upload New
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
                    <h1 className="text-3xl font-bold mb-2">My Wallpapers</h1>
                    <p className="text-gray-400 mb-6">Manage your wallpapers and view analytics</p>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading wallpapers...</div>
                    ) : wallpapers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 mb-4">No wallpapers yet</p>
                            <Link href="/brand/upload" className="inline-block px-6 py-3 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-black font-bold rounded-lg hover:opacity-90 transition-opacity">
                                Upload Your First Wallpaper
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wallpapers.map((wallpaper) => {
                                const totalSets = getTotalSets(wallpaper.id)
                                const isApproved = wallpaper.status === 'approved'

                                return (
                                    <div
                                        key={wallpaper.id}
                                        className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#FBBF24] transition-colors"
                                    >
                                        <div className="relative aspect-[9/19.5]">
                                            <Image
                                                src={wallpaper.image_url}
                                                alt={wallpaper.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold mb-1">{wallpaper.title}</h3>
                                            {wallpaper.description && (
                                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                                    {wallpaper.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(wallpaper.status)}`}>
                                                    {wallpaper.status.charAt(0).toUpperCase() + wallpaper.status.slice(1)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(wallpaper.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {isApproved && (
                                                <button
                                                    onClick={() => setSelectedWallpaper(
                                                        selectedWallpaper === wallpaper.id ? null : wallpaper.id
                                                    )}
                                                    className="w-full py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#FBBF24] transition-colors text-sm font-medium"
                                                >
                                                    {selectedWallpaper === wallpaper.id ? 'Hide Stats' : 'View Stats'}
                                                </button>
                                            )}

                                            {selectedWallpaper === wallpaper.id && isApproved && (
                                                <div className="mt-3 p-3 bg-[#1a1a1a] rounded-lg">
                                                    <div className="text-sm font-medium text-gray-400 mb-2">
                                                        Total Sets: <span className="text-[#FBBF24] text-lg">{totalSets}</span>
                                                    </div>
                                                    {stats.length > 0 && (
                                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                                            {stats.slice(0, 7).map((stat) => (
                                                                <div key={stat.date} className="flex justify-between text-xs">
                                                                    <span className="text-gray-500">
                                                                        {new Date(stat.date).toLocaleDateString()}
                                                                    </span>
                                                                    <span className="text-gray-300">{stat.count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

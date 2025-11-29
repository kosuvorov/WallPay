'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface WallpaperStat {
    id: string
    title: string
    brand_name: string
    total_sets: number
}

interface DailyStat {
    date: string
    count: number
}

export default function AdminAnalyticsPage() {
    const [user, setUser] = useState<any>(null)
    const [topWallpapers, setTopWallpapers] = useState<WallpaperStat[]>([])
    const [todayTotal, setTodayTotal] = useState(0)
    const [weekTotal, setWeekTotal] = useState(0)
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
            loadAnalytics()
        }

        checkAuth()
    }, [router, supabase])

    async function loadAnalytics() {
        setLoading(true)

        // Get today's total
        const today = new Date().toISOString().split('T')[0]
        const { count: todayCount } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00`)

        setTodayTotal(todayCount || 0)

        // Get this week's total
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { count: weekCount } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString())

        setWeekTotal(weekCount || 0)

        // Get top wallpapers (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: events } = await supabase
            .from('analytics_events')
            .select('wallpaper_id')
            .gte('created_at', thirtyDaysAgo.toISOString())

        if (events) {
            // Count events per wallpaper
            const counts: { [key: string]: number } = {}
            events.forEach((event) => {
                counts[event.wallpaper_id] = (counts[event.wallpaper_id] || 0) + 1
            })

            // Get wallpaper details for top 10
            const topIds = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([id]) => id)

            if (topIds.length > 0) {
                const { data: wallpapers } = await supabase
                    .from('wallpapers')
                    .select('id, title, brand_name')
                    .in('id', topIds)

                if (wallpapers) {
                    const stats = wallpapers.map((w) => ({
                        ...w,
                        total_sets: counts[w.id] || 0,
                    }))
                        .sort((a, b) => b.total_sets - a.total_sets)

                    setTopWallpapers(stats)
                }
            }
        }

        setLoading(false)

        // Subscribe to real-time updates
        const channel = supabase
            .channel('analytics_updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'analytics_events',
            }, () => {
                loadAnalytics()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
                        <Link href="/admin/pending" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] transition-colors">
                            Pending
                        </Link>
                        <Link href="/admin/schedule" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] transition-colors">
                            Schedule
                        </Link>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Global Analytics</h1>
                    <p className="text-gray-400 mb-8">Platform-wide wallpaper performance</p>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading analytics...</div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
                                    <div className="text-gray-400 text-sm font-medium mb-2">Today's Sets</div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                                        {todayTotal.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {new Date().toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
                                    <div className="text-gray-400 text-sm font-medium mb-2">Last 7 Days</div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-[#F97316] to-[#DC2626] bg-clip-text text-transparent">
                                        {weekTotal.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Average: {Math.round(weekTotal / 7).toLocaleString()} / day
                                    </div>
                                </div>
                            </div>

                            {/* Top Wallpapers */}
                            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
                                <h2 className="text-2xl font-bold mb-4">Top Wallpapers (Last 30 Days)</h2>

                                {topWallpapers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        No data yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {topWallpapers.map((wallpaper, index) => (
                                            <div
                                                key={wallpaper.id}
                                                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-black' :
                                                            index === 1 ? 'bg-[#D1D5DB] text-black' :
                                                                index === 2 ? 'bg-[#CD7F32] text-white' :
                                                                    'bg-[#2a2a2a] text-gray-400'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{wallpaper.title}</div>
                                                        <div className="text-sm text-gray-400">{wallpaper.brand_name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold text-[#F97316]">
                                                    {wallpaper.total_sets.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface ApprovedWallpaper {
    id: string
    brand_name: string
    title: string
    image_url: string
}

interface Selection {
    wallpaper_id: string
    live_date: string
}

export default function AdminSchedulePage() {
    const [user, setUser] = useState<any>(null)
    const [wallpapers, setWallpapers] = useState<ApprovedWallpaper[]>([])
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedWallpapers, setSelectedWallpapers] = useState<string[]>([])
    const [existingSelections, setExistingSelections] = useState<Selection[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
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

            // Set default date to tomorrow
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            setSelectedDate(tomorrow.toISOString().split('T')[0])

            loadApproved()
        }

        checkAuth()
    }, [router, supabase])

    useEffect(() => {
        if (selectedDate) {
            loadSelections(selectedDate)
        }
    }, [selectedDate, supabase])

    async function loadApproved() {
        setLoading(true)
        const { data, error } = await supabase
            .from('wallpapers')
            .select('id, brand_name, title, image_url')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setWallpapers(data)
        }
        setLoading(false)
    }

    async function loadSelections(date: string) {
        const { data } = await supabase
            .from('daily_wallpaper_selections')
            .select('wallpaper_id, live_date')
            .eq('live_date', date)

        if (data) {
            setExistingSelections(data)
            setSelectedWallpapers(data.map(s => s.wallpaper_id))
        } else {
            setSelectedWallpapers([])
        }
    }

    function toggleWallpaper(id: string) {
        setSelectedWallpapers(prev => {
            if (prev.includes(id)) {
                return prev.filter(w => w !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    async function handleSave() {
        if (!selectedDate || selectedWallpapers.length < 1) {
            setMessage('Please select at least 1 wallpaper')
            return
        }

        if (selectedWallpapers.length > 15) {
            setMessage('Maximum 15 wallpapers per day')
            return
        }

        setSaving(true)
        setMessage('')

        try {
            // Delete existing selections for this date
            await supabase
                .from('daily_wallpaper_selections')
                .delete()
                .eq('live_date', selectedDate)

            // Insert new selections
            const selections = selectedWallpapers.map(wallpaper_id => ({
                wallpaper_id,
                live_date: selectedDate,
                selected_by: user.id,
            }))

            const { error } = await supabase
                .from('daily_wallpaper_selections')
                .insert(selections)

            if (error) throw error

            setMessage(`✓ Saved ${selectedWallpapers.length} wallpapers for ${selectedDate}`)
            setTimeout(() => setMessage(''), 3000)
        } catch (err: any) {
            setMessage(`Error: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    const isWallpaperSelected = (id: string) => selectedWallpapers.includes(id)

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
                        <Link href="/admin/analytics" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] transition-colors">
                            Analytics
                        </Link>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mb-6">
                    <h1 className="text-3xl font-bold mb-2">Schedule Daily Wallpapers</h1>
                    <p className="text-gray-400 mb-6">Select 8-15 wallpapers for the chosen date</p>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#F97316] focus:outline-none"
                            />
                            <button
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#F97316] text-sm transition-colors"
                            >
                                Today
                            </button>
                            {selectedDate === new Date().toISOString().split('T')[0] && (
                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded border border-green-500/20">
                                    LIVE NOW
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400">
                            Selected: <span className="text-[#F97316] font-bold">{selectedWallpapers.length}</span> / 1-15
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || selectedWallpapers.length < 1 || selectedWallpapers.length > 15}
                            className="ml-auto px-6 py-2 bg-gradient-to-r from-[#F97316] to-[#DC2626] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Schedule'}
                        </button>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg mb-4 ${message.startsWith('✓')
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-4">Approved Wallpapers</h2>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading...</div>
                    ) : wallpapers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No approved wallpapers available
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {wallpapers.map((wallpaper) => {
                                const selected = isWallpaperSelected(wallpaper.id)
                                return (
                                    <button
                                        key={wallpaper.id}
                                        onClick={() => toggleWallpaper(wallpaper.id)}
                                        className={`bg-[#0a0a0a] border-2 rounded-xl overflow-hidden transition-all ${selected
                                            ? 'border-[#F97316] ring-2 ring-[#F97316]/50'
                                            : 'border-[#2a2a2a] hover:border-[#F97316]/50'
                                            }`}
                                    >
                                        <div className="relative aspect-[9/19.5]">
                                            <Image
                                                src={wallpaper.image_url}
                                                alt={wallpaper.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            {selected && (
                                                <div className="absolute top-2 right-2 w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 text-left">
                                            <div className="text-xs text-[#F97316] font-medium mb-0.5">
                                                {wallpaper.brand_name}
                                            </div>
                                            <div className="text-sm font-medium line-clamp-1">
                                                {wallpaper.title}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function BrandUploadPage() {
    const [user, setUser] = useState<any>(null)
    const [brandName, setBrandName] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image1242, setImage1242] = useState<File | null>(null)
    const [image1179, setImage1179] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
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
                .select('role, brand_name')
                .eq('id', user.id)
                .single()

            if (userData?.role !== 'brand') {
                router.push('/brand/login')
                return
            }

            setUser(user)
            setBrandName(userData.brand_name || '')
        }

        checkAuth()
    }, [router, supabase])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !image1242 || !image1179) return

        setUploading(true)
        setError('')
        setSuccess(false)

        try {
            // Upload images to Supabase Storage
            const timestamp = Date.now()
            const image1242Path = `${user.id}/${timestamp}_1242.jpg`
            const image1179Path = `${user.id}/${timestamp}_1179.jpg`

            const { error: upload1242Error } = await supabase.storage
                .from('wallpapers')
                .upload(image1242Path, image1242)

            if (upload1242Error) throw upload1242Error

            const { error: upload1179Error } = await supabase.storage
                .from('wallpapers')
                .upload(image1179Path, image1179)

            if (upload1179Error) throw upload1179Error

            // Get public URLs
            const { data: url1242 } = supabase.storage
                .from('wallpapers')
                .getPublicUrl(image1242Path)

            const { data: url1179 } = supabase.storage
                .from('wallpapers')
                .getPublicUrl(image1179Path)

            // Create wallpaper record
            const { error: insertError } = await supabase
                .from('wallpapers')
                .insert({
                    brand_id: user.id,
                    brand_name: brandName,
                    title,
                    description,
                    image_url_1242: url1242.publicUrl,
                    image_url_1179: url1179.publicUrl,
                    status: 'pending',
                })

            if (insertError) throw insertError

            setSuccess(true)
            setTitle('')
            setDescription('')
            setImage1242(null)
            setImage1179(null)

            // Reset file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]')
            fileInputs.forEach((input: any) => (input.value = ''))

            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                        WallPay
                    </Link>
                    <Link href="/brand/wallpapers" className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#FBBF24] transition-colors">
                        My Wallpapers
                    </Link>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Upload Wallpaper</h1>
                    <p className="text-gray-400 mb-6">Upload your brand wallpaper for approval</p>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Wallpaper Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors"
                                placeholder="Summer Collection 2024"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors resize-none"
                                placeholder="Brief description of your wallpaper"
                            />
                        </div>

                        <div>
                            <label htmlFor="image1242" className="block text-sm font-medium mb-2">
                                Image (1242×2688) *
                            </label>
                            <input
                                id="image1242"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage1242(e.target.files?.[0] || null)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#FBBF24] file:to-[#F97316] file:text-black file:font-medium file:cursor-pointer"
                            />
                        </div>

                        <div>
                            <label htmlFor="image1179" className="block text-sm font-medium mb-2">
                                Image (1179×2556) *
                            </label>
                            <input
                                id="image1179"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage1179(e.target.files?.[0] || null)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#FBBF24] file:to-[#F97316] file:text-black file:font-medium file:cursor-pointer"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
                                Wallpaper uploaded successfully! Awaiting approval.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || !image1242 || !image1179}
                            className="w-full py-3 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Wallpaper'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

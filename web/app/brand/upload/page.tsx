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
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageFile) {
            setMessage('Please select an image')
            return
        }

        setUploading(true)
        setMessage('')

        try {
            const user = (await supabase.auth.getUser()).data.user
            if (!user) throw new Error('Not authenticated')

            // Upload single image to storage
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('wallpapers')
                .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('wallpapers')
                .getPublicUrl(fileName)

            // Insert wallpaper record
            const { error: insertError } = await supabase
                .from('wallpapers')
                .insert({
                    brand_id: user.id,
                    brand_name: brandName,
                    title: title,
                    description: description,
                    image_url: publicUrl,
                    status: 'pending'
                })

            if (insertError) throw insertError

            setMessage('Wallpaper uploaded successfully! Awaiting approval.')
            setTitle('')
            setDescription('')
            setImageFile(null)

            // Reset file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''

            setTimeout(() => setMessage(''), 3000)

        } catch (error: any) {
            setMessage(`Error: ${error.message}`)
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

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <label htmlFor="wallpaper-image" className="block text-sm font-medium mb-2">
                                Wallpaper Image
                            </label>
                            <input
                                id="wallpaper-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#FBBF24] file:to-[#F97316] file:text-black file:font-medium file:cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">Upload a high-resolution vertical image (will be auto-cropped for different screen sizes)</p>
                        </div>

                        {message && (
                            <div className={`rounded-lg p-3 text-sm ${message.includes('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || !imageFile}
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

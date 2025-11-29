'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            // Verify user is a superadmin
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', authData.user.id)
                .single()

            if (userError) throw userError

            if (userData.role !== 'superadmin') {
                throw new Error('Unauthorized - Superadmin access required')
            }

            router.push('/admin/pending')
        } catch (err: any) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <Link href="/" className="inline-block mb-8">
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#F97316] to-[#DC2626] bg-clip-text text-transparent">
                        ← WallPay Admin
                    </div>
                </Link>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Superadmin Portal</h1>
                    <p className="text-gray-400 mb-6">Sign in to manage WallPay</p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#F97316] focus:outline-none transition-colors"
                                placeholder="admin@wallpay.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#F97316] focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-[#F97316] to-[#DC2626] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

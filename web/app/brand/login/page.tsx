'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function BrandLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignup, setIsSignup] = useState(false)
    const [brandName, setBrandName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isSignup) {
                // Sign up new brand account
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                })

                if (signUpError) throw signUpError

                if (authData.user) {
                    // Create user profile with brand role
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email,
                            role: 'brand',
                            brand_name: brandName,
                        })

                    if (profileError) throw profileError

                    router.push('/brand/upload')
                }
            } else {
                // Sign in existing brand
                const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (signInError) throw signInError

                // Verify user is a brand
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single()

                if (userError) throw userError

                if (userData.role !== 'brand') {
                    throw new Error('Invalid credentials for brand portal')
                }

                router.push('/brand/wallpapers')
            }
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
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                        ← WallPay
                    </div>
                </Link>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Brand Portal</h1>
                    <p className="text-gray-400 mb-6">
                        {isSignup ? 'Create your brand account' : 'Sign in to your brand account'}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignup && (
                            <div>
                                <label htmlFor="brandName" className="block text-sm font-medium mb-2">
                                    Brand Name
                                </label>
                                <input
                                    id="brandName"
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors"
                                    placeholder="Your Brand Name"
                                />
                            </div>
                        )}

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
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors"
                                placeholder="brand@example.com"
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
                                minLength={6}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:border-[#FBBF24] focus:outline-none transition-colors"
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
                            className="w-full py-3 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                setIsSignup(!isSignup)
                                setError('')
                            }}
                            className="text-sm text-gray-400 hover:text-[#FBBF24] transition-colors"
                        >
                            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

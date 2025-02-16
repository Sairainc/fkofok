'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('Error signing up:', error.message)
    } else {
      router.refresh()
    }
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('Error signing in:', error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        onClick={handleSignUp}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        サインアップ
      </button>
      <button
        onClick={handleSignIn}
        className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        サインイン
      </button>
    </div>
  )
} 
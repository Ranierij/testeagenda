'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const router = useRouter()

    const entrar = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        })

        if (error) {
            alert('Erro no login')
            return
        }

        router.push('/')
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="bg-white p-6 rounded shadow w-80">
                <h1 className="text-xl mb-4">Login</h1>

                <input
                    placeholder="Email"
                    className="w-full border p-2 mb-2"
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    className="w-full border p-2 mb-4"
                    onChange={e => setSenha(e.target.value)}
                />

                <button
                    onClick={entrar}
                    className="w-full bg-pink-500 text-white p-2 rounded"
                >
                    Entrar
                </button>
            </div>
        </div>
    )
}
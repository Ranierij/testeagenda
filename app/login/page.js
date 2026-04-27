'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const router = useRouter()

    const entrar = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        })

        console.log("LOGIN DATA:", data)
        console.log("LOGIN ERROR:", error)

        if (error) {
            alert(error.message) // 👈 agora você vai ver o erro de verdade
            return
        }

        // pequena garantia de persistência
        setTimeout(() => {
            router.push('/')
        }, 300)
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
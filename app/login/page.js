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
            alert(error.message)
            return
        }

        router.push('/')
    }

    return (
        <div className="min-h-screen flex">

            {/* ESQUERDA */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 px-6">
                <div className="w-full max-w-md space-y-6 text-center">

                    {/* LOGO */}
                    <h1 className="text-4xl font-bold text-purple-800">
                        World Nails
                    </h1>

                    <p className="text-purple-700 font-medium">
                        A sua clínica de forma mais prática.
                    </p>

                    {/* INPUTS */}
                    <div className="space-y-3 text-left">
                        <input
                            placeholder="Email"
                            className="w-full p-3 border rounded-md bg-white"
                            onChange={e => setEmail(e.target.value)}
                        />

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Senha"
                                className="w-full p-3 border rounded-md bg-white pr-10"
                                onChange={e => setSenha(e.target.value)}
                            />

                            {/* Ícone olho (fake por enquanto) */}
                            <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                                👁️
                            </span>
                        </div>

                        <div className="text-right">
                            <a className="text-sm text-purple-700 cursor-pointer">
                                Esqueci minha senha
                            </a>
                        </div>
                    </div>

                    {/* BOTÃO */}
                    <button
                        onClick={entrar}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full font-semibold"
                    >
                        Entrar
                    </button>

                    {/* GOOGLE */}
                    <button className="w-full border py-3 rounded-full flex items-center justify-center gap-2">
                        <span>🔵</span>
                        Entrar com Google
                    </button>

                    {/* FOOTER */}
                    <p className="text-sm text-gray-600">
                        Ainda não possui uma conta?{' '}
                        <span className="text-purple-700 font-semibold cursor-pointer">
                            Crie agora
                        </span>
                    </p>
                </div>
            </div>

            {/* DIREITA */}
            <div className="hidden md:block w-[40%] 
    bg-[url('/lateral.png')] 
    bg-cover 
    bg-center 
    bg-no-repeat">
            </div>

        </div>
    )
}
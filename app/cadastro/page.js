'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Cadastro() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const cadastrar = async () => {
        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        alert('Cadastro realizado! Verifique seu email 📩')
        setLoading(false)

        router.push('/login')
    }

    return (
        <div className="min-h-screen flex">

            {/* ESQUERDA */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 px-6">
                <div className="w-full max-w-md space-y-6 text-center">

                    <h1 className="text-4xl font-bold text-purple-700">
                        Criar Conta
                    </h1>

                    <p className="text-purple-600">
                        Cadastre-se para começar
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
                                type={mostrarSenha ? 'text' : 'password'}
                                placeholder="Senha"
                                className="w-full p-3 border rounded-md bg-white pr-10"
                                onChange={e => setSenha(e.target.value)}
                            />

                            <span
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-3 cursor-pointer"
                            >
                                {mostrarSenha ? '🙈' : '👁️'}
                            </span>
                        </div>
                    </div>

                    {/* BOTÃO */}
                    <button
                        onClick={cadastrar}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>

                    {/* VOLTAR LOGIN */}
                    <p className="text-sm text-gray-600">
                        Já possui uma conta?{' '}
                        <Link href="/login" className="text-purple-700 font-semibold">
                            Entrar
                        </Link>
                    </p>

                </div>
            </div>

            {/* DIREITA */}
            <div className="hidden md:block w-[40%] 
                bg-[url('/lateral.jpg')] 
                bg-cover 
    bg-center 
    bg-no-repeat">
            </div>

        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function NovoColaborador() {

    const router = useRouter()
    const { user } = useAuth()

    const [nome, setNome] = useState("")
    const [empresaId, setEmpresaId] = useState(null)

    useEffect(() => {
        carregarEmpresa()
    }, [user])

    async function carregarEmpresa() {

        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user?.id) return

        const { data } = await supabase
            .from("perfis")
            .select("empresa_id")
            .eq("user_id", authData.user.id)
            .single()

        if (data) {
            setEmpresaId(data.empresa_id)
        }
    }

    async function salvar() {

        if (!nome) {
            alert("Nome obrigatório")
            return
        }

        const { data: authData } = await supabase.auth.getUser()

        const { error } = await supabase
            .from("colaboradores")
            .insert({
                nome,
                user_id: authData.user.id,
                empresa_id: empresaId
            })

        if (error) {
            alert(error.message)
            return
        }

        router.push("/colaboradores")
    }

    return (

        <div className="min-h-screen bg-[#f6f6f6]">

            <div className="bg-white border-b px-6 py-4 flex items-center gap-4">

                <button
                    onClick={() => router.push("/colaboradores")}
                    className="text-xl"
                >
                    ←
                </button>

                <h1 className="text-2xl font-semibold">
                    Novo Colaborador
                </h1>

            </div>

            <div className="max-w-xl mx-auto p-6">

                <div className="bg-white rounded-2xl p-6 shadow-sm">

                    <input
                        type="text"
                        placeholder="Nome do colaborador"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="
                            w-full
                            border
                            rounded-xl
                            px-4 py-3
                            mb-4
                        "
                    />

                    <button
                        onClick={salvar}
                        className="
                            w-full
                            bg-green-500
                            hover:bg-green-600
                            text-white
                            py-3
                            rounded-xl
                            font-medium
                        "
                    >
                        Salvar
                    </button>

                </div>

            </div>

        </div>

    )
}
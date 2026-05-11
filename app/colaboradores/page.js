"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"


export default function Colaboradores() {

    const router = useRouter()
    const { user } = useAuth()

    const [nome, setNome] = useState("")
    const [colaboradores, setColaboradores] = useState([])
    const [empresaId, setEmpresaId] = useState(null)

    useEffect(() => {
        if (empresaId) {
            carregar()
        }
    }, [empresaId])

    useEffect(() => {
        carregarEmpresa()
    }, [user])

    async function carregarEmpresa() {

        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user?.id) return

        const { data, error } = await supabase
            .from("perfis")
            .select("empresa_id")
            .eq("user_id", authData.user.id)
            .single()

        if (error) {
            console.log(error)
            return
        }

        setEmpresaId(data.empresa_id)
    }

    async function carregar() {

        if (!empresaId) return

        const { data, error } = await supabase
            .from("colaboradores")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("created_at", { ascending: false })

        console.log("COLABORADORES EMPRESA:", data)

        if (error) {
            console.log(error)
            return
        }

        setColaboradores(data || [])
    }

    async function salvar() {

        if (!nome) return alert("Nome obrigatório")

        if (!empresaId) {
            alert("Empresa não carregada")
            return
        }

        const { data: authData } = await supabase.auth.getUser()
        console.log("EMPRESA ID:", empresaId)
        const { error } = await supabase
            .from("colaboradores")
            .insert({
                nome,
                user_id: authData?.user?.id,
                empresa_id: empresaId
            })

        if (error) {
            alert(error.message)
            return
        }

        setNome("")
        carregar()
    }

    async function excluir(id) {

        const ok = confirm("Excluir colaborador?")
        if (!ok) return

        await supabase.from("colaboradores").delete().eq("id", id)
        carregar()
    }

    return (

        <div className="min-h-screen bg-[#f6f6f6]">

            {/* TOPO */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => router.push("/agenda")}
                        className="text-xl"
                    >
                        ←
                    </button>

                    <h1 className="text-2xl font-semibold">
                        Colaboradores
                    </h1>

                </div>

                <button
                    onClick={() => router.push("/colaboradores/novo")}
                    className="
                    w-11 h-11
                    rounded-full
                    bg-black
                    text-white
                    text-2xl
                    flex items-center justify-center
                "
                >
                    +
                </button>

            </div>

            {/* BARRA */}
            <div className="bg-white border-b p-4 flex gap-3">

                <input
                    placeholder="Nome do colaborador"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="
                    flex-1
                    border
                    rounded-lg
                    px-4 py-2
                    bg-white
                "
                />

            </div>

            {/* LISTA */}
            <div>

                {colaboradores
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map(c => (

                        <div
                            key={c.id}
                            className="
                            flex items-center justify-between
                            px-6 py-5
                            border-b
                            bg-white
                        "
                        >

                            {/* ESQUERDA */}
                            <div className="flex items-center gap-4">

                                {/* BOLINHA */}
                                <div className="
                                w-10 h-10
                                rounded-full
                                bg-gray-200
                            " />

                                {/* NOME */}
                                <button
                                    onClick={() => router.push(`/colaboradores/${c.id}`)}
                                    className="
        flex-1 text-left
        font-medium
        text-pink-500
    "
                                >
                                    {c.nome}
                                </button>
                            </div>

                            {/* DIREITA */}
                            <div className="flex items-center gap-4">

                                <button
                                    onClick={() => router.push(`/colaboradores/${c.id}`)}
                                    className="text-pink-500"
                                >
                                    <User size={22} />
                                </button>

                                <button
                                    onClick={() => excluir(c.id)}
                                    className="
                                    text-gray-400
                                    text-xl
                                "
                                >
                                    ⋮
                                </button>

                            </div>

                        </div>

                    ))}

            </div>

        </div>

    )
}
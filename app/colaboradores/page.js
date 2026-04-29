"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Colaboradores() {

    const router = useRouter()

    const [nome, setNome] = useState("")
    const [colaboradores, setColaboradores] = useState([])

    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {
        const { data } = await supabase
            .from("colaboradores")
            .select("*")
            .order("created_at", { ascending: false })

        setColaboradores(data || [])
    }

    async function salvar() {

        if (!nome) return alert("Nome obrigatório")

        const { data: authData } = await supabase.auth.getUser()

        const { error } = await supabase
            .from("colaboradores")
            .insert({
                nome,
                user_id: authData?.user?.id
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
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">

                <div className="flex justify-between mb-4">
                    <button onClick={() => router.push("/agenda")}>←</button>
                    <h1 className="font-bold">Colaboradores</h1>
                </div>

                <input
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full border p-2 mb-2"
                />

                <button
                    onClick={salvar}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Salvar
                </button>

                <div className="mt-4 space-y-2">
                    {colaboradores.map(c => (
                        <div key={c.id} className="flex justify-between border p-2 rounded">
                            <span>{c.nome}</span>

                            <button
                                onClick={() => excluir(c.id)}
                                className="bg-red-500 text-white px-2 rounded"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
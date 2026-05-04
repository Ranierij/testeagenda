"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Clientes() {

    const router = useRouter()
    const { user, loading } = useAuth()

    const [clientes, setClientes] = useState([])
    const [busca, setBusca] = useState("")
    const [modalCliente, setModalCliente] = useState(false)
    const [clienteEditando, setClienteEditando] = useState(null)

    // 🔥 CARREGAR CLIENTES
    const carregarClientes = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from("clientes")
            .select("*")
            .eq("user_id", user.id)
            .order("nome", { ascending: true })

        if (error) {
            console.error("Erro:", error)
            return
        }

        setClientes(data || [])
    }, [user])

    // 🔥 DISPARA CARREGAMENTO
    useEffect(() => {
        if (!user) return

        async function carregar() {
            const { data, error } = await supabase
                .from("clientes")
                .select("*")
                .eq("user_id", user.id)
                .order("nome", { ascending: true })

            if (error) {
                console.error(error)
                return
            }

            setClientes(data || [])
        }

        carregar()
    }, [user])

    // 🔥 FILTRO BUSCA
    const clientesFiltrados = clientes
        .filter(c =>
            c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
            c.telefone?.includes(busca)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome))

    if (loading) return <div className="p-4">Carregando...</div>
    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-100 p-4">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">

                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                >
                    ←
                </button>

                <h1 className="text-xl font-bold">Clientes</h1>

                <button
                    onClick={() => router.push("/clientes/novo")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                    + Cliente
                </button>

            </div>

            {/* BUSCA */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Procurar por nome ou telefone..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                />
            </div>

            {/* LISTA */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

                {clientesFiltrados.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        Nenhum cliente encontrado
                    </div>
                )}

                {clientesFiltrados.map(cliente => (
                    <div
                        key={cliente.id}
                        className="flex items-center justify-between border-b px-4 py-3 hover:bg-gray-50"
                    >

                        {/* ESQUERDA */}
                        <div className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                className="
    w-5 h-5
    accent-blue-600
    cursor-pointer
  "
                            />

                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                                {cliente.nome?.charAt(0)}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-base font-semibold">{cliente.nome}</span>
                                <span className="text-sm text-gray-500">
                                    {cliente.telefone}
                                </span>
                            </div>

                        </div>

                        {/* DIREITA */}
                        <button
                            onClick={() => {
                                setClienteEditando(cliente)
                                setModalCliente(true)
                            }}
                            className="text-gray-500 hover:text-black text-xl"
                        >
                            ⋮
                        </button>

                    </div>
                ))}

            </div>

            {/* MODAL EDITAR */}
            {modalCliente && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-xl w-80">

                        <h2 className="text-lg font-bold mb-4">
                            Editar Cliente
                        </h2>

                        <input
                            value={clienteEditando?.nome || ""}
                            onChange={(e) =>
                                setClienteEditando(prev => ({
                                    ...prev,
                                    nome: e.target.value
                                }))
                            }
                            className="w-full border p-2 mb-2 rounded"
                            placeholder="Nome"
                        />

                        <input
                            value={clienteEditando?.telefone || ""}
                            onChange={(e) =>
                                setClienteEditando(prev => ({
                                    ...prev,
                                    telefone: e.target.value
                                }))
                            }
                            className="w-full border p-2 mb-4 rounded"
                            placeholder="Telefone"
                        />

                        <button
                            onClick={async () => {

                                if (!clienteEditando?.nome) {
                                    alert("Nome obrigatório")
                                    return
                                }

                                const { error } = await supabase
                                    .from("clientes")
                                    .update({
                                        nome: clienteEditando.nome,
                                        telefone: clienteEditando.telefone
                                    })
                                    .eq("id", clienteEditando.id)

                                if (error) {
                                    alert(error.message)
                                    return
                                }

                                setModalCliente(false)
                                setClienteEditando(null)
                                carregarClientes()
                            }}
                            className="w-full bg-green-500 text-white p-2 rounded mb-2"
                        >
                            Salvar
                        </button>

                        <button
                            onClick={() => setModalCliente(false)}
                            className="w-full bg-gray-300 p-2 rounded"
                        >
                            Cancelar
                        </button>

                    </div>

                </div>
            )}

        </div>
    )
}

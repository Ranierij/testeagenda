"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Servicos() {

    const router = useRouter()

    const [nome, setNome] = useState("")
    const [valor, setValor] = useState("")
    const [duracao, setDuracao] = useState("")
    const [servicos, setServicos] = useState([])
    const [editandoId, setEditandoId] = useState(null)

    useEffect(() => {
        carregarServicos()
    }, [])

    async function carregarServicos() {
        const { data } = await supabase
            .from("servicos")
            .select("*")
            .order("created_at", { ascending: false })

        setServicos(data || [])
    }

    function editar(servico) {
        setNome(servico.nome)
        setValor(servico.valor)
        setDuracao(servico.duracao || "")
        setEditandoId(servico.id)
    }

    async function excluir(id) {

        const confirmar = confirm("Deseja excluir este serviço?")
        if (!confirmar) return

        const { error } = await supabase
            .from("servicos")
            .delete()
            .eq("id", id)

        if (error) {
            alert(error.message)
            return
        }

        carregarServicos()
    }

    async function salvar() {

        if (!nome || !valor) {
            alert("Nome e valor são obrigatórios")
            return
        }

        const { data: authData } = await supabase.auth.getUser()
        const userId = authData?.user?.id || null

        let error

        if (editandoId) {
            // 🔥 UPDATE
            const res = await supabase
                .from("servicos")
                .update({
                    nome,
                    valor: parseFloat(valor),
                    duracao: duracao ? parseInt(duracao) : null,
                })
                .eq("id", editandoId)

            error = res.error
        } else {
            // 🔥 INSERT
            const res = await supabase
                .from("servicos")
                .insert({
                    nome,
                    valor: parseFloat(valor),
                    duracao: duracao ? parseInt(duracao) : null,
                    user_id: userId
                })

            error = res.error
        }

        if (error) {
            alert(error.message)
            return
        }

        // reset
        setNome("")
        setValor("")
        setDuracao("")
        setEditandoId(null)

        carregarServicos()
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">

            <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 space-y-4">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.push("/agenda")}
                        className="text-lg hover:scale-110 transition"
                    >
                        ←
                    </button>

                    <h1 className="text-xl font-bold text-gray-800">
                        Serviços
                    </h1>
                </div>

                {/* FORM */}
                <input
                    placeholder="Nome do serviço"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    placeholder="Valor (ex: 50.00)"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    placeholder="Duração (minutos)"
                    value={duracao}
                    onChange={e => setDuracao(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                />

                <button
                    onClick={salvar}
                    className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    {editandoId ? "Atualizar Serviço" : "Salvar Serviço"}
                </button>

                {/* LISTA */}
                <div className="pt-4 space-y-2">

                    {servicos.map(s => (
                        <div
                            key={s.id}
                            className="border p-3 rounded flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{s.nome}</p>
                                <p className="text-sm text-gray-500">
                                    {s.duracao ? `${s.duracao} min` : ""}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="font-bold">
                                    R$ {Number(s.valor).toFixed(2)}
                                </p>

                                <button
                                    onClick={() => editar(s)}
                                    className="bg-yellow-400 px-2 py-1 rounded text-sm"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => excluir(s.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}
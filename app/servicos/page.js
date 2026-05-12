"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"


export default function Servicos() {

    const router = useRouter()

    const [nome, setNome] = useState("")
    const [valor, setValor] = useState("")
    const [duracao, setDuracao] = useState("")

    const [modalNovo, setModalNovo] = useState(false)
    const [modalEditar, setModalEditar] = useState(false)

    const [servicoSelecionado, setServicoSelecionado] = useState(null)

    const [servicos, setServicos] = useState([])
    const [editandoId, setEditandoId] = useState(null)

    const { user } = useAuth()

    useEffect(() => {
        carregarServicos()
    }, [])


    async function carregarServicos() {

        console.log("CARREGANDO SERVICOS")

        const { data, error } = await supabase
            .from("servicos")
            .select("*")

        console.log("SERVICOS:", data)
        console.log("ERRO:", error)

        if (error) {
            console.log(error)
            return
        }

        setServicos(data || [])
    }

    function editar(servico) {

        setNome(servico.nome)
        setValor(servico.valor)
        setDuracao(servico.duracao || "")
        setEditandoId(servico.id)
    }

    async function salvar() {

        if (!nome || !valor) {
            alert("Nome e valor são obrigatórios")
            return
        }

        const { data: authData } = await supabase.auth.getUser()
        const userId = authData?.user?.id || null

        if (!userId) {
            alert("Usuário não autenticado")
            return
        }

        // 🔥 BUSCAR PERFIL (empresa)
        const { data: perfil, error: perfilError } = await supabase
            .from("perfis")
            .select("empresa_id")
            .eq("user_id", userId)
            .single()

        if (perfilError) {
            alert("Erro ao buscar empresa")
            return
        }

        let error

        if (editandoId) {
            // 🔥 UPDATE (MANTIDO IGUAL)
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
            // 🔥 INSERT (SÓ CORRIGIDO AQUI)
            const res = await supabase
                .from("servicos")
                .insert({
                    nome,
                    valor: parseFloat(valor),
                    duracao: duracao ? parseInt(duracao) : null,
                    user_id: userId,
                    empresa_id: perfil.empresa_id
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

        setModalNovo(false)
        setModalEditar(false)

        setServicoSelecionado(null)

        await carregarServicos()
    }
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
            <div className="w-full bg-white min-h-screen">

                {/* HEADER */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.push("/agenda")}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition group active:scale-95"
                    >
                        <svg
                            className="w-5 h-5 stroke-gray-700 transition-transform duration-300 group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
                        </svg>
                    </button>

                    <h1 className="flex-1 text-center text-xl font-bold text-gray-800">
                        Serviços
                    </h1>

                    {/* Espaço para manter o título centralizado */}
                    <div className="w-10" />
                </div>

                {/* FORM */}
                <div className="flex justify-end">

                    <button
                        onClick={() => {
                            setNome("")
                            setValor("")
                            setDuracao("")
                            setEditandoId(null)
                            setModalNovo(true)
                        }}
                        className="
            w-12 h-12 rounded-full
            bg-black text-white
            text-3xl
            flex items-center justify-center
        "
                    >
                        +
                    </button>

                </div>

                {/* LISTA */}
                <div className="pt-2">

                    {servicos.map(s => (

                        <div
                            key={s.id}
                            className="
    flex items-center justify-between
    px-6 py-5
    border-b
    bg-white
    hover:bg-gray-50
    transition
"
                        >

                            {/* ESQUERDA */}
                            <div>

                                <div className="font-semibold text-pink-500">
                                    {s.nome}
                                </div>

                                <div className="text-sm text-gray-500 mt-1">
                                    R$ {Number(s.valor).toFixed(2)}

                                    {s.duracao && (
                                        <> • {s.duracao} min</>
                                    )}
                                </div>

                            </div>

                            {/* DIREITA */}
                            <button
                                onClick={() => {

                                    setServicoSelecionado(s)

                                    editar(s)

                                    setModalEditar(true)
                                }}
                                className="
                    text-gray-400
                    text-2xl
                    px-2
                "
                            >
                                ⋮
                            </button>

                        </div>

                    ))}

                </div>

            </div>

            {modalNovo && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-2xl w-80">

                        <h2 className="text-lg font-bold mb-4">
                            Novo Serviço
                        </h2>

                        <input
                            placeholder="Nome do serviço"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="w-full border p-3 rounded-lg mb-3"
                        />

                        <input
                            placeholder="Valor"
                            value={valor}
                            onChange={e => setValor(e.target.value)}
                            className="w-full border p-3 rounded-lg mb-3"
                        />

                        <input
                            placeholder="Duração (min)"
                            value={duracao}
                            onChange={e => setDuracao(e.target.value)}
                            className="w-full border p-3 rounded-lg mb-4"
                        />

                        <button
                            onClick={async () => {

                                await salvar()

                                await carregarServicos()

                                setModalNovo(false)
                            }}
                            className="w-full bg-pink-500 text-white p-3 rounded-xl mb-2"
                        >
                            Salvar Serviço
                        </button>

                        <button
                            onClick={() => setModalNovo(false)}
                            className="w-full bg-gray-200 p-3 rounded-xl"
                        >
                            Cancelar
                        </button>

                    </div>

                </div>

            )}

            {/* MODAL EDITAR */}
            {modalEditar && servicoSelecionado && (

                <div className="
        fixed inset-0 z-50
        bg-pink/500
        flex items-center justify-center
        p-4
    ">

                    <div className="
            bg-white w-full max-w-md
            rounded-2xl p-6
            space-y-4
        ">

                        <h2 className="text-xl font-bold">
                            Editar Serviço
                        </h2>

                        <input
                            placeholder="Nome do serviço"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="w-full border p-3 rounded-lg"
                        />

                        <input
                            placeholder="Valor"
                            value={valor}
                            onChange={e => setValor(e.target.value)}
                            className="w-full border p-3 rounded-lg"
                        />

                        <input
                            placeholder="Duração"
                            value={duracao}
                            onChange={e => setDuracao(e.target.value)}
                            className="w-full border p-3 rounded-lg"
                        />

                        <div className="flex gap-3">

                            <button
                                onClick={async () => {

                                    await salvar()

                                    setModalEditar(false)

                                    setServicoSelecionado(null)
                                }}
                                className="
                        flex-1
                        bg-pink-500
                        text-white
                        p-3
                        rounded-xl
                    "
                            >
                                Salvar
                            </button>

                            <button
                                onClick={() => {
                                    setModalEditar(false)
                                    setServicoSelecionado(null)

                                    setNome("")
                                    setValor("")
                                    setDuracao("")
                                    setEditandoId(null)
                                }}
                                className="
                        flex-1
                        bg-gray-200
                        p-3
                        rounded-xl
                    "
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}
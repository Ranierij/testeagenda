"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function Financeiro() {

    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [verDetalhes, setVerDetalhes] = useState(false)

    const hoje = new Date()

    const carregar = async () => {
        const { data: ag } = await supabase.from("agendamentos").select("*")
        const { data: cl } = await supabase.from("clientes").select("*")

        setAgendamentos(ag || [])
        setClientes(cl || [])
    }

    useEffect(() => {
        carregar()
    }, [])

    function getCliente(id) {
        return clientes.find(c => c.id === id)
    }

    const hojeStr =
        hoje.getFullYear() + "-" +
        String(hoje.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoje.getDate()).padStart(2, "0")

    const agHoje = agendamentos.filter(a => a.data === hojeStr)

    // 💰 SOMA REAL (SEM VALOR FIXO)
    const totalDinheiro = agHoje
        .filter(a => a.forma_pagamento === "dinheiro")
        .reduce((total, a) => total + (a.valor || 0), 0)

    const totalPix = agHoje
        .filter(a => a.forma_pagamento === "pix")
        .reduce((total, a) => total + (a.valor || 0), 0)

    const totalCartao = agHoje
        .filter(a => a.forma_pagamento === "cartao")
        .reduce((total, a) => total + (a.valor || 0), 0)

    const total = totalDinheiro + totalPix + totalCartao

    return (
        <div className="p-4">

            <h1 className="text-2xl font-bold mb-4">
                Financeiro do Dia
            </h1>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                <div className="bg-green-500 text-white p-4 rounded-xl shadow">
                    <div>💵 Dinheiro</div>
                    <div className="text-xl font-bold">
                        R$ {totalDinheiro.toFixed(2)}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {agHoje.filter(a => a.forma_pagamento === "dinheiro").length} atendimentos
                    </div>
                </div>

                <div className="bg-blue-500 text-white p-4 rounded-xl shadow">
                    <div>📲 Pix</div>
                    <div className="text-xl font-bold">
                        R$ {totalPix.toFixed(2)}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {agHoje.filter(a => a.forma_pagamento === "pix").length} atendimentos
                    </div>
                </div>

                <div className="bg-purple-500 text-white p-4 rounded-xl shadow">
                    <div>💳 Cartão</div>
                    <div className="text-xl font-bold">
                        R$ {totalCartao.toFixed(2)}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {agHoje.filter(a => a.forma_pagamento === "cartao").length} atendimentos
                    </div>
                </div>

            </div>

            {/* TOTAL */}
            <div className="bg-gray-900 text-white p-4 rounded-xl mb-4 shadow">
                <div className="text-sm">Total do dia</div>
                <div className="text-2xl font-bold">
                    R$ {total.toFixed(2)}
                </div>
            </div>

            <button
                onClick={() => setVerDetalhes(true)}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Ver detalhes
            </button>

            {/* MODAL DETALHES */}
            <AnimatePresence>
                {verDetalhes && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >

                        <motion.div
                            className="bg-white p-6 rounded w-96 max-h-[80vh] overflow-y-auto"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                        >

                            <h2 className="text-lg font-bold mb-3">
                                Detalhes do dia
                            </h2>

                            {agHoje.length === 0 && (
                                <p className="text-gray-500">
                                    Nenhum atendimento hoje
                                </p>
                            )}

                            {agHoje.map((a, i) => {
                                const cliente = getCliente(a.cliente_id)

                                return (
                                    <div key={i} className="border-b py-2">

                                        <div className="font-semibold">
                                            {cliente?.nome || "Cliente"}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {a.hora} • {a.forma_pagamento}
                                        </div>

                                        <div className="text-sm font-bold">
                                            R$ {(a.valor || 0).toFixed(2)}
                                        </div>

                                    </div>
                                )
                            })}

                            <button
                                onClick={() => setVerDetalhes(false)}
                                className="w-full mt-4 bg-gray-300 p-2 rounded"
                            >
                                Fechar
                            </button>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
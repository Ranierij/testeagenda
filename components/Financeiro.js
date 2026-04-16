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

    const totalDinheiro = agHoje
        .filter(a => a.forma_pagamento === "dinheiro")
        .length * 50

    const totalPix = agHoje
        .filter(a => a.forma_pagamento === "pix")
        .length * 50

    const totalCartao = agHoje
        .filter(a => a.forma_pagamento === "cartao")
        .length * 50

    const total = totalDinheiro + totalPix + totalCartao

    return (
        <div className="p-4">

            <h1 className="text-2xl font-bold mb-4">
                Financeiro do Dia
            </h1>

            <div className="grid grid-cols-3 gap-4 mb-4">

                <div className="bg-green-500 text-white p-4 rounded-xl">
                    💵 Dinheiro
                    <div className="text-xl font-bold">
                        R$ {totalDinheiro}
                    </div>
                </div>

                <div className="bg-blue-500 text-white p-4 rounded-xl">
                    📲 Pix
                    <div className="text-xl font-bold">
                        R$ {totalPix}
                    </div>
                </div>

                <div className="bg-purple-500 text-white p-4 rounded-xl">
                    💳 Cartão
                    <div className="text-xl font-bold">
                        R$ {totalCartao}
                    </div>
                </div>

            </div>

            <div className="bg-gray-200 p-4 rounded-xl mb-4">
                <div className="text-lg font-bold">
                    Total: R$ {total}
                </div>
            </div>

            <button
                onClick={() => setVerDetalhes(true)}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Ver detalhes
            </button>

            <AnimatePresence>
                {verDetalhes && (
                    <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                        <div className="bg-white p-6 rounded w-96 max-h-[80vh] overflow-y-auto">

                            <h2 className="text-lg font-bold mb-3">
                                Detalhes do dia
                            </h2>

                            {agHoje.map((a, i) => {
                                const cliente = getCliente(a.cliente_id)

                                return (
                                    <div key={i} className="border-b py-2">

                                        <div className="font-semibold">
                                            {cliente?.nome}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {a.hora} • {a.forma_pagamento}
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

                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
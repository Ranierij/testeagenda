"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"

export default function Agenda() {

    const [data, setData] = useState(new Date())
    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])

    const [modalNovo, setModalNovo] = useState(false)
    const [modalView, setModalView] = useState(false)

    const [clienteId, setClienteId] = useState("")
    const [duracao, setDuracao] = useState(60)

    const [eventoSelecionado, setEventoSelecionado] = useState(null)
    const [horaSelecionada, setHoraSelecionada] = useState(null)

    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
    const router = useRouter()
    const pathname = usePathname()


    const [formaPagamento, setFormaPagamento] = useState("dinheiro")
    const [valor, setValor] = useState("")
    const [modoEdicao, setModoEdicao] = useState(false)

    const [servicos, setServicos] = useState([])
    const [servicoId, setServicoId] = useState("")
    const [servicoSelecionado, setServicoSelecionado] = useState(null)

    const [colaboradores, setColaboradores] = useState([])
    const [colaboradorId, setColaboradorId] = useState("")
    const [colaboradorFiltro, setColaboradorFiltro] = useState("")

    const HORA_ALTURA = 80 // px por hora
    const PIXEL_POR_MINUTO = HORA_ALTURA / 60

    const horas = []
    for (let h = 8; h <= 18; h++) {
        horas.push(`${String(h).padStart(2, "0")}:00`)
    }

    const carregar = async () => {
        const { data: ag } = await supabase.from("agendamentos").select("*")
        const { data: cl } = await supabase.from("clientes").select("*")
        const { data: sv } = await supabase.from("servicos").select("*")
        const { data: col } = await supabase.from("colaboradores").select("*")


        console.log("COLABORADORES:", col)

        setAgendamentos(ag || [])
        setClientes(cl || [])
        setServicos(sv || [])
        setColaboradores(col || [])
    }

    useEffect(() => {
        carregar()
    }, [data])

    function formatarData(d) {
        return d.toLocaleDateString("pt-BR")
    }

    function mudarDia(dias) {
        const nova = new Date(data)
        nova.setDate(nova.getDate() + dias)
        setData(nova)
    }

    function abrirNovo(hora) {
        setHoraSelecionada(hora)
        setModalNovo(true)
    }

    function abrirEvento(evt) {
        setEventoSelecionado(evt)
        setModalView(true)
        setConfirmandoCancelamento(false)
    }

    function getCliente(id) {
        return clientes.find(c => c.id === id)
    }

    function getColaborador(id) {
        return colaboradores.find(c => c.id === id)
    }
    function getCorColaborador(id) {
        const cores = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-indigo-500"
        ]

        const index = colaboradores.findIndex(c => c.id === id)
        return cores[index % cores.length]
    }

    function getEventosHora(hora) {
        return agendamentos.filter(a => {
            if (!a.inicio || !a.fim) return false

            // 🔥 filtro por colaborador
            if (colaboradorFiltro && a.colaborador_id !== colaboradorFiltro) {
                return false
            }

            const inicio = new Date(a.inicio.replace(" ", "T"))
            const fim = new Date(a.fim.replace(" ", "T"))

            const mesmoDia =
                inicio.getDate() === data.getDate() &&
                inicio.getMonth() === data.getMonth() &&
                inicio.getFullYear() === data.getFullYear()

            if (!mesmoDia) return false

            const [h, m] = hora.split(":")
            const slot = new Date(data)
            slot.setHours(Number(h), Number(m), 0, 0)

            return slot >= inicio && slot < fim
        })
    }

    function getEventosHoraColaborador(hora, colaboradorId) {
        return agendamentos.filter(a => {
            if (!a.inicio || !a.fim) return false

            if (a.colaborador_id !== colaboradorId) return false

            const inicio = new Date(a.inicio.replace(" ", "T"))
            const fim = new Date(a.fim.replace(" ", "T"))

            const mesmoDia =
                inicio.getDate() === data.getDate() &&
                inicio.getMonth() === data.getMonth() &&
                inicio.getFullYear() === data.getFullYear()

            if (!mesmoDia) return false

            const [h, m] = hora.split(":")
            const slot = new Date(data)
            slot.setHours(Number(h), Number(m), 0, 0)

            return slot >= inicio && slot < fim
        })
    }

    function gerarCalendario() {
        const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0)
        const dias = []

        for (let i = 1; i <= fimMes.getDate(); i++) {
            dias.push(new Date(data.getFullYear(), data.getMonth(), i))
        }

        return dias
    }

    function calcularEstiloEvento(evt) {
        const inicio = new Date(evt.inicio.replace(" ", "T"))
        const fim = new Date(evt.fim.replace(" ", "T"))

        const minutosInicio = inicio.getHours() * 60 + inicio.getMinutes()
        const minutosFim = fim.getHours() * 60 + fim.getMinutes()

        const top = (minutosInicio - 8 * 60) * PIXEL_POR_MINUTO
        const height = (minutosFim - minutosInicio) * PIXEL_POR_MINUTO

        return {
            top: `${top}px`,
            height: `${height}px`
        }
    }

    const salvar = async () => {
        if (!clienteId) return alert("Selecione o cliente")
        if (!colaboradorId) return alert("Selecione o colaborador")
        if (!servicoId) return alert("Selecione o serviço")
        const dia =
            data.getFullYear() + "-" +
            String(data.getMonth() + 1).padStart(2, "0") + "-" +
            String(data.getDate()).padStart(2, "0")

        const [h, m] = horaSelecionada.split(":")

        const inicio = new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate(),
            Number(h),
            Number(m)
        )

        const fim = new Date(inicio.getTime() + duracao * 60000)

        function formatLocal(date) {
            const pad = (n) => String(n).padStart(2, "0")

            return (
                date.getFullYear() + "-" +
                pad(date.getMonth() + 1) + "-" +
                pad(date.getDate()) + " " +
                pad(date.getHours()) + ":" +
                pad(date.getMinutes()) + ":00"
            )
        }

        const inicioStr = formatLocal(inicio)
        const fimStr = formatLocal(fim)

        const conflito = agendamentos.some(a => {

            if (modoEdicao && a.id === eventoSelecionado.id) return false

            // 🔥 só bloqueia se for o MESMO COLABORADOR
            if (a.colaborador_id !== colaboradorId) return false

            const aInicio = new Date(a.inicio.replace(" ", "T"))
            const aFim = new Date(a.fim.replace(" ", "T"))

            return (
                inicio < aFim &&
                fim > aInicio
            )
        })

        if (conflito) {
            alert("Horário já está ocupado")
            return
        }

        // 🔥 AQUI NOVA LÓGICA
        if (modoEdicao) {
            const { error } = await supabase
                .from("agendamentos")
                .update({
                    cliente_id: clienteId,
                    servico_id: servicoId,
                    colaborador_id: colaboradorId,
                    inicio: inicioStr,
                    fim: fimStr,
                    forma_pagamento: formaPagamento,
                    valor: Number(valor),
                    duracao: duracao
                })
                .eq("id", eventoSelecionado.id)

            if (error) {
                console.log("ERRO UPDATE:", error)
                alert(error.message)
                return
            }
        } else {
            const { error } = await supabase
                .from("agendamentos")
                .insert({
                    cliente_id: clienteId,
                    servico_id: servicoId, // 🔥 NOVO
                    colaborador_id: colaboradorId,
                    inicio: inicioStr,
                    fim: fimStr,
                    data: dia,
                    hora: horaSelecionada,
                    forma_pagamento: formaPagamento,
                    valor: Number(valor),
                    duracao: duracao // 🔥 importante pra agenda inteligente
                })

            if (error) {
                console.log("ERRO SUPABASE:", error)
                alert(error.message)
                return
            }
        }

        // 🔥 FINAL DA FUNÇÃO (IMPORTANTE NÃO DUPLICAR CHAVES)
        setModoEdicao(false)
        setModalNovo(false)
        setClienteId("")
        setColaboradorId("")
        setValor("")
        carregar()
    }

    async function cancelarAgendamento() {

        const { error } = await supabase
            .from("agendamentos")
            .delete()
            .eq("id", eventoSelecionado.id)

        if (error) {
            alert("Erro ao cancelar")
            return
        }

        setModalView(false)
        carregar()
    }

    function abrirWhatsApp() {
        const cliente = getCliente(eventoSelecionado.cliente_id)

        if (!cliente?.telefone) {
            alert("Cliente sem telefone")
            return
        }

        const numero = cliente.telefone.replace(/\D/g, "")
        window.open(`https://wa.me/55${numero}`, "_blank")
    }

    const listaColaboradores = colaboradorFiltro
        ? colaboradores.filter(c => c.id === colaboradorFiltro)
        : colaboradores
    return (
        <div className="flex flex-col min-h-screen">

            <div style={{ height: "150px" }} className="w-full bg-gray-300 flex items-center justify-center mt-3 rounded-xl shadow-sm">
                Ads 💰
            </div>

            <div className="flex flex-wrap justify-center gap-4 p-3 bg-white border-b">



                <button
                    onClick={() => router.push("/agenda")}
                    className={`px-7 py-3 rounded-xl transition active:scale-95
        ${pathname === "/agenda"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }
    `}
                >
                    Agenda
                </button>

                <button
                    onClick={() => router.push("/clientes")}
                    className={`px-7 py-3 rounded-xl transition active:scale-95
        ${pathname === "/clientes"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }
    `}
                >
                    Clientes
                </button>

                <button
                    onClick={() => router.push("/colaboradores")}
                    className="bg-gray-200 px-7 py-3 rounded-xl hover:bg-gray-300 transition active:scale-95"
                >
                    Colaboradores
                </button>

                <button
                    onClick={() => router.push("/servicos")}
                    className={`px-7 py-3 rounded-xl transition active:scale-95
        ${pathname === "/servicos"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }
    `}
                >
                    Serviços
                </button>



                <button
                    onClick={() => router.push("/financeiro")}
                    className="bg-gray-200 px-7 py-3 rounded-xl hover:bg-gray-300 transition active:scale-95"
                >
                    Financeiro
                </button>

                <button
                    onClick={() => setModalNovo(true)}
                    className="bg-green-500 text-white px-7 py-3 rounded-xl hover:bg-green-600 transition active:scale-95"
                >
                    + Agendar
                </button>

            </div>



            <div className="flex flex-col md:flex-row flex-1">

                {/* SIDEBAR */}
                <div className="hidden md:flex w-72 bg-gray-100 p-4 flex-col">


                    <h2 className="font-bold mb-2">Calendário</h2>

                    <div className="grid grid-cols-7 gap-1 text-xs">
                        {gerarCalendario().map((d, i) => {

                            const isHoje = d.toDateString() === new Date().toDateString()
                            const isSelecionado = d.toDateString() === data.toDateString()

                            return (
                                <div
                                    key={i}
                                    onClick={() => setData(d)}
                                    className={`
                                        p-2 text-center cursor-pointer rounded
                                        ${isSelecionado ? "bg-blue-600 text-white" : ""}
                                        ${!isSelecionado && isHoje ? "bg-blue-100" : ""}
                                        hover:bg-blue-200
                                    `}
                                >
                                    {d.getDate()}
                                </div>
                            )
                        })}
                    </div>

                    <h2 className="font-bold mt-4 mb-2">Clientes</h2>

                    <div className="flex-1 overflow-y-auto">
                        {clientes.map(c => (
                            <div key={c.id} className="bg-blue-500 text-white p-2 mb-2 rounded">
                                {c.nome}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 bg-gray-300 h-72 flex items-center justify-center rounded">
                        Ads 💰
                    </div>

                </div>

                <div className="flex-1 overflow-y-auto">

                    <div className="flex items-center justify-center gap-10 p-4 border-b bg-white">

                        <button onClick={() => mudarDia(-1)} className="bg-gray-200 px-5 py-3 rounded-xl text-lg">
                            ⬅️
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={data.toISOString()}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.2 }}
                                className="text-xl font-bold text-center min-w-[160px]"
                            >
                                {formatarData(data)}
                            </motion.div>
                        </AnimatePresence>

                        <button onClick={() => mudarDia(1)} className="bg-gray-200 px-5 py-3 rounded-xl text-lg">
                            ➡️
                        </button>

                    </div>

                    <div className="overflow-x-auto md:overflow-visible">
                        {/* HEADER COLABORADORES */}
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `80px repeat(${colaboradores.length}, minmax(140px, 1fr))`
                            }}
                        >
                            <div></div>
                            {colaboradores.map(col => (
                                <div
                                    key={col.id}
                                    className={`text-center font-semibold p-3 text-white ${getCorColaborador(col.id)}`}
                                >
                                    {col.nome}
                                </div>
                            ))}
                        </div>

                        <div className="w-full overflow-x-auto border-b bg-white">
                            <div className="flex gap-2 px-2 py-2 min-w-max">

                                {/* ABA TODOS */}
                                <button
                                    onClick={() => setColaboradorFiltro("")}
                                    className={`
                px-4 py-2 rounded-full text-sm whitespace-nowrap transition
                ${!colaboradorFiltro
                                            ? "bg-black text-white"
                                            : "bg-gray-200 hover:bg-gray-300"}
            `}
                                >
                                    Todos
                                </button>

                                {/* ABAS COLABORADORES */}
                                {colaboradores.map(col => (
                                    <button
                                        key={col.id}
                                        onClick={() => setColaboradorFiltro(col.id)}
                                        className={`
                    px-4 py-2 rounded-full text-sm whitespace-nowrap text-white transition
                    ${getCorColaborador(col.id)}
                    ${colaboradorFiltro === col.id
                                                ? "ring-2 ring-black scale-105"
                                                : "opacity-70"}
                `}
                                    >
                                        {col.nome}
                                    </button>
                                ))}

                            </div>
                        </div>

                        {/* LINHAS DE HORÁRIO */}
                        {horas.map(hora => (
                            <div
                                key={hora}
                                className="grid"
                                style={{
                                    gridTemplateColumns: `80px repeat(${colaboradores.length}, minmax(140px, 1fr))`
                                }}
                            >

                                {/* HORA */}
                                <div className="p-2 text-sm text-gray-500 border-r">
                                    {hora}
                                </div>

                                {/* COLUNAS */}
                                {colaboradores.map(col => {
                                    const eventos = getEventosHoraColaborador(hora, col.id)
                                    const ocupado = eventos.length > 0

                                    return (
                                        <div
                                            key={col.id}
                                            className={`
                            relative h-24 border-r transition
                            ${colaboradorFiltro === col.id ? "bg-yellow-50" : ""}
                            ${ocupado ? "bg-gray-50" : "hover:bg-gray-100"}
                        `}
                                            onClick={() => {
                                                if (!ocupado) {
                                                    setColaboradorId(col.id)
                                                    abrirNovo(hora)
                                                }
                                            }}
                                        >

                                            {eventos.map((evt, i) => {
                                                const cliente = getCliente(evt.cliente_id)

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            abrirEvento(evt)
                                                        }}
                                                        className={`
                                        absolute inset-1
                                        ${getCorColaborador(evt.colaborador_id)}
                                        text-white
                                        rounded p-2 text-xs
                                        cursor-pointer
                                    `}
                                                    >
                                                        <div className="font-semibold text-sm leading-tight">
                                                            {cliente?.nome}
                                                        </div>

                                                        <div className="text-[10px] opacity-80">
                                                            {hora}
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        </div>
                                    )
                                })}

                            </div>
                        ))}

                    </div>


                </div>
            </div>

            <AnimatePresence>
                {modalNovo && (
                    <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
                        <div className="bg-white p-6 rounded w-80">

                            <h2 className="text-lg font-bold mb-3">
                                Novo Agendamento ({horaSelecionada})
                            </h2>

                            <select
                                value={clienteId}
                                onChange={(e) => setClienteId(e.target.value)}
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value="">Selecione o cliente</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={colaboradorId}
                                onChange={(e) => setColaboradorId(e.target.value)}
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value="">Selecione o colaborador</option>

                                {colaboradores.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={servicoId}
                                onChange={(e) => {
                                    const id = e.target.value
                                    setServicoId(id)

                                    const servico = servicos.find(s => s.id === id)
                                    setServicoSelecionado(servico)

                                    // 🔥 auto preenche valor e duração
                                    if (servico) {
                                        setValor(servico.valor)
                                        setDuracao(servico.duracao || 60)
                                    }
                                }}
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value="">Selecione o serviço</option>

                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.nome} - R$ {Number(s.valor).toFixed(2)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={duracao}
                                onChange={(e) => setDuracao(Number(e.target.value))}
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value={30}>30 min</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1h30</option>
                                <option value={120}>2 horas</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Valor (R$)"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full border p-2 mb-3 rounded"
                            />

                            <select
                                value={formaPagamento}
                                onChange={(e) => setFormaPagamento(e.target.value)}
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value="dinheiro">Dinheiro</option>
                                <option value="pix">Pix</option>
                                <option value="cartao">Cartão</option>
                            </select>

                            <button
                                onClick={salvar}
                                disabled={!clienteId || !colaboradorId || !servicoId}
                                className="w-full bg-green-500 disabled:bg-gray-300 text-white p-2 mb-2 rounded"
                            >
                                Salvar
                            </button>

                            <button
                                onClick={() => setModalNovo(false)}
                                className="w-full bg-gray-300 p-2 rounded"
                            >
                                Cancelar
                            </button>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalView && eventoSelecionado && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    >
                        <div className="bg-white p-6 rounded w-80">

                            <h2 className="text-lg font-bold mb-3">
                                Detalhes do Agendamento
                            </h2>
                            <button
                                onClick={() => {

                                    const inicio = new Date(eventoSelecionado.inicio.replace(" ", "T"))

                                    setClienteId(eventoSelecionado.cliente_id || "")
                                    setColaboradorId(eventoSelecionado.colaborador_id || "")
                                    setServicoId(eventoSelecionado.servico_id || "")

                                    setHoraSelecionada(
                                        `${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}`
                                    )

                                    setValor(eventoSelecionado.valor || "")
                                    setFormaPagamento(eventoSelecionado.forma_pagamento || "dinheiro")

                                    const dur =
                                        (new Date(eventoSelecionado.fim.replace(" ", "T")) -
                                            new Date(eventoSelecionado.inicio.replace(" ", "T"))) / 60000

                                    setDuracao(dur)

                                    setModoEdicao(true)
                                    setModalView(false)
                                    setModalNovo(true)
                                }}
                                className="w-full bg-blue-500 text-white p-2 mb-2 rounded"
                            >
                                Editar
                            </button>

                            <div className="mb-2">
                                <strong>Cliente:</strong>{" "}
                                {getCliente(eventoSelecionado.cliente_id)?.nome || "—"}
                            </div>

                            <div className="mb-2">
                                <strong>Horário:</strong>{" "}
                                {new Date(eventoSelecionado.inicio.replace(" ", "T")).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </div>

                            <div className="mb-2">
                                <strong>Forma de pagamento:</strong>{" "}
                                {eventoSelecionado.forma_pagamento}
                            </div>

                            <div className="mb-4">
                                <strong>Valor:</strong>{" "}
                                R$ {eventoSelecionado.valor || 0}
                            </div>

                            <button
                                onClick={abrirWhatsApp}
                                className="w-full bg-green-500 text-white p-2 mb-2 rounded"
                            >
                                WhatsApp
                            </button>

                            <button
                                onClick={() => setConfirmandoCancelamento(true)}
                                className="w-full bg-red-500 text-white p-2 mb-2 rounded"
                            >
                                Cancelar Agendamento
                            </button>

                            {confirmandoCancelamento && (
                                <button
                                    onClick={cancelarAgendamento}
                                    className="w-full bg-red-700 text-white p-2 mb-2 rounded"
                                >
                                    Confirmar Cancelamento
                                </button>
                            )}

                            <button
                                onClick={() => setModalView(false)}
                                className="w-full bg-gray-300 p-2 rounded"
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
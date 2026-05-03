"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Users, User, Scissors, Wallet } from "lucide-react"
import { Plus } from "lucide-react"



function NavButton({ href, children, pathname, router }) {
    const ativo = pathname.startsWith(href)

    return (
        <button
            onClick={() => router.push(href)}
            className={`
                px-7 py-3 rounded-xl transition active:scale-95
                ${ativo
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }
            `}
        >
            {children}
        </button>
    )
}

function MobileNavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center flex-1 py-1"
        >
            <div
                className={`
                    transition-all duration-200
                    ${active ? "text-black scale-110" : "text-gray-400"}
                `}
            >
                {icon}
            </div>

            <span
                className={`
                    text-[10px] mt-1
                    ${active ? "text-black font-medium" : "text-gray-400"}
                `}
            >
                {label}
            </span>

            {active && (
                <div className="w-1 h-1 bg-black rounded-full mt-1" />
            )}
        </button>
    )
}

export default function Agenda() {

    const [data, setData] = useState(new Date())
    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [mostrarCalendario, setMostrarCalendario] = useState(false)


    const [modalNovo, setModalNovo] = useState(false)
    const [modalView, setModalView] = useState(false)

    const [clienteId, setClienteId] = useState("")
    const [duracao, setDuracao] = useState(60)
    const [user, setUser] = useState(null)

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
    const [isMobile, setIsMobile] = useState(false)
    const larguraColuna = isMobile ? 90 : 140
    const larguraHora = isMobile ? 60 : 80

    const horas = []
    for (let h = 8; h <= 18; h++) {
        horas.push(`${String(h).padStart(2, "0")}:00`)
    }

    const carregar = useCallback(async () => {
        try {
            const [agRes, clRes, svRes, colRes] = await Promise.all([
                supabase.from("agendamentos").select("*"),
                supabase.from("clientes").select("*"),
                supabase.from("servicos").select("*"),
                supabase.from("colaboradores").select("*"),
            ])

            setAgendamentos(agRes.data || [])
            setClientes(clRes.data || [])
            setServicos(svRes.data || [])
            setColaboradores(colRes.data || [])
        } catch (err) {
            console.error("Erro ao carregar:", err)
        }
    }, [])


    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }

        getUser()
    }, [])

    useEffect(() => {
        if (user) {
            carregar()
        }
    }, [user, data, carregar])

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize() // roda quando abre a tela

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }

        getUser()
    }, [])

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
        if (!user) {
            alert("Erro: usuário não carregado")
            return
        }
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
                    user_id: user.id,
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
                    user_id: user.id,
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
        <div className="flex flex-col min-h-screen pb-20 md:pb-0">

            <div style={{ height: "150px" }} className="w-full bg-gray-300 flex items-center justify-center mt-3 rounded-xl shadow-sm">
                Ads 💰
            </div>

            <div className="hidden md:flex flex-wrap justify-center gap-4 p-3 bg-white border-b">

                <NavButton href="/agenda" pathname={pathname} router={router}>
                    Agenda
                </NavButton>

                <NavButton href="/clientes" pathname={pathname} router={router}>
                    Clientes
                </NavButton>

                <NavButton href="/colaboradores" pathname={pathname} router={router}>

                    Colaboradores
                </NavButton>

                <NavButton href="/servicos" pathname={pathname} router={router}>
                    Serviços
                </NavButton>

                <NavButton href="/financeiro" pathname={pathname} router={router}>
                    Financeiro
                </NavButton>

                <button
                    onClick={() => setModalNovo(true)}
                    className="bg-green-500 text-white px-7 py-3 rounded-xl hover:bg-green-600 transition active:scale-95"
                >
                    + Agendar
                </button>

            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t flex justify-around items-center py-2 z-50">

                <MobileNavItem
                    icon={<Calendar size={20} />}
                    label="Agenda"
                    active={pathname.startsWith("/agenda")}
                    onClick={() => router.push("/agenda")}
                />

                <MobileNavItem
                    icon={<Users size={20} />}
                    label="Clientes"
                    active={pathname.startsWith("/clientes")}
                    onClick={() => router.push("/clientes")}
                />

                <MobileNavItem
                    icon={<User size={20} />}
                    label="Colab"
                    active={pathname.startsWith("/colaboradores")}
                    onClick={() => router.push("/colaboradores")}
                />

                <MobileNavItem
                    icon={<Scissors size={20} />}
                    label="Serviços"
                    active={pathname.startsWith("/servicos")}
                    onClick={() => router.push("/servicos")}
                />

                <MobileNavItem
                    icon={<Wallet size={20} />}
                    label="Financeiro"
                    active={pathname.startsWith("/financeiro")}
                    onClick={() => router.push("/financeiro")}
                />

            </div>

            <motion.button
                onClick={() => setModalNovo(true)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="
        fixed bottom-24 right-4 md:bottom-6 md:right-6
        bg-black text-white
        w-14 h-14 rounded-full
        flex items-center justify-center
        shadow-lg
        z-50
    "
            >
                <Plus size={24} />
            </motion.button>


            <div className="flex flex-col md:flex-row flex-1">

                {/* SIDEBAR */}
                <div className="hidden md:flex w-64 bg-white border-r flex-col p-4">



                    <div className="mt-4 bg-gray-300 h-72 flex items-center justify-center rounded">
                        Ads 💰
                    </div>

                </div>

                <div className="flex-1 overflow-y-auto">

                    <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-40">

                        {/* ESQUERDA */}
                        <button
                            onClick={() => mudarDia(-1)}
                            className="bg-gray-100 px-3 py-2 rounded-lg"
                        >
                            ⬅️
                        </button>

                        {/* CENTRO (DATA) */}
                        <button
                            onClick={() => setMostrarCalendario(true)}
                            className="flex flex-col items-center justify-center px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <span className="text-lg font-semibold leading-none">
                                {data.getDate()}
                            </span>

                            <span className="text-xs text-gray-500 uppercase">
                                {data.toLocaleDateString("pt-BR", { month: "short" })}
                            </span>

                            <span className="text-[10px] text-gray-400">
                                {data.getFullYear()}
                            </span>
                        </button>

                        {/* DIREITA */}
                        <button
                            onClick={() => mudarDia(1)}
                            className="bg-gray-100 px-3 py-2 rounded-lg"
                        >
                            ➡️
                        </button>

                    </div>

                    <div className="overflow-x-auto">                        {/* HEADER COLABORADORES */}
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `80px repeat(${colaboradores.length}, minmax(90px, 1fr))`
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
                                    gridTemplateColumns: `${larguraHora}px repeat(${colaboradores.length}, minmax(${larguraColuna}px, 1fr))`
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
                                        rounded-lg
                                        shadow-sm
                                        hover:shadow-md
                                        transition
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

            <AnimatePresence>
                {mostrarCalendario && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    >
                        <div className="bg-white p-4 rounded-xl w-80">

                            <h2 className="font-semibold mb-3 text-center">
                                Selecionar Data
                            </h2>

                            <div className="grid grid-cols-7 gap-1 text-sm">
                                {gerarCalendario().map((d, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setData(d)
                                            setMostrarCalendario(false)
                                        }}
                                        className="p-2 text-center rounded hover:bg-gray-200 cursor-pointer"
                                    >
                                        {d.getDate()}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setMostrarCalendario(false)}
                                className="w-full mt-3 bg-gray-200 p-2 rounded"
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
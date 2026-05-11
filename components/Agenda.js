"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Users, User, Scissors, Wallet } from "lucide-react"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"



function NavButton({ href, children, pathname, router }) {
    const ativo = pathname?.startsWith(href)
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
    const [empresaId, setEmpresaId] = useState(null)
    const [perfil, setPerfil] = useState(null)
    const [mostrarCalendario, setMostrarCalendario] = useState(false)
    const [mesAtual, setMesAtual] = useState(new Date())



    const [modalNovo, setModalNovo] = useState(false)
    const [modalView, setModalView] = useState(false)
    const { user, loading } = useAuth()

    const [clienteId, setClienteId] = useState("")
    const [buscaCliente, setBuscaCliente] = useState("")
    const [mostrarBuscaCliente, setMostrarBuscaCliente] = useState(false)
    const [mostrarBuscaColaborador, setMostrarBuscaColaborador] = useState(false)
    const buscaRef = useRef(null)
    const [duracao, setDuracao] = useState(60)
    const [repetir, setRepetir] = useState(false)
    const [diasRepeticao, setDiasRepeticao] = useState(1)


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
    const [loadingEmpresa, setLoadingEmpresa] = useState(true)

    const HORA_ALTURA = 80 // px por hora
    const PIXEL_POR_MINUTO = HORA_ALTURA / 60

    const [isMobile, setIsMobile] = useState(false)

    const [larguraColuna, setLarguraColuna] = useState(140)
    const [autoColunas, setAutoColunas] = useState(true)

    const larguraHora = isMobile ? 60 : 80

    const [colaboradoresVisiveis, setColaboradoresVisiveis] = useState([])

    const HORA_INICIO = 8
    const HORA_FIM = 22

    const clientesFiltrados = clientes.filter(cliente => {

        const termo = buscaCliente.toLowerCase()

        return (
            cliente.nome?.toLowerCase().includes(termo) ||
            cliente.telefone?.toLowerCase().includes(termo)
        )
    })

    const horas = []

    for (let h = HORA_INICIO; h <= HORA_FIM; h++) {
        horas.push(`${String(h).padStart(2, "0")}:00`)
        horas.push(`${String(h).padStart(2, "0")}:30`)
    }


    const carregar = useCallback(async () => {
        if (!user || !empresaId) return

        try {

            const [
                agRes,
                clRes,
                svRes,
                colRes,
                perfilRes
            ] = await Promise.all([

                supabase
                    .from("agendamentos")
                    .select("*")
                    .eq("empresa_id", empresaId),

                supabase
                    .from("clientes")
                    .select("*")
                    .eq("empresa_id", empresaId),

                supabase
                    .from("servicos")
                    .select("*")
                    .eq("empresa_id", empresaId),

                supabase
                    .from("colaboradores")
                    .select("*")
                    .eq("empresa_id", empresaId),

                supabase
                    .from("perfis")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle()

            ])

            console.log("PERFIL:", perfilRes.data)

            setPerfil(perfilRes.data)

            setAgendamentos(agRes.data || [])
            setClientes(clRes.data || [])
            setServicos(svRes.data || [])
            const cols = colRes.data || []

            console.log("COLABORADORES:", cols)

            setColaboradores(cols)


            setColaboradoresVisiveis(prev => {
                if (prev.length > 0) return prev
                return cols.map(c => c.id)
            })

        } catch (err) {
            console.error("Erro ao carregar:", err)
        }
    }, [user, empresaId]) // 👈 CRÍTICO





    useEffect(() => {

        async function carregarPerfil() {

            console.log("INICIO carregarPerfil")

            if (!user) {
                console.log("SEM USER")
                setLoadingEmpresa(false)
                return
            }

            const { data, error } = await supabase
                .from("perfis")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle()

            console.log("DATA PERFIL:", data)
            console.log("ERRO PERFIL:", error)

            if (error) {
                setLoadingEmpresa(false)
                return
            }

            if (!data) {
                console.log("PERFIL NÃO EXISTE")

                setLoadingEmpresa(false)
                return
            }

            setPerfil(data)
            setEmpresaId(data.empresa_id)

            console.log("EMPRESA ID:", data.empresa_id)

            setLoadingEmpresa(false)
        }

        carregarPerfil()

    }, [user])

    useEffect(() => {
        if (empresaId) {
            carregar()
        }
    }, [empresaId, carregar])

    useEffect(() => {
        if (colaboradores.length > 0) {
            setColaboradoresVisiveis(
                colaboradores.map(c => c.id)
            )
        }
    }, [colaboradores])

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                buscaRef.current &&
                !buscaRef.current.contains(event.target)
            ) {
                setMostrarBuscaCliente(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, [])

    // todos useState, useEffect, useCallback aqui em cima

    if (loading) return <div>Carregando usuário...</div>
    if (loadingEmpresa) return <div>Carregando empresa...</div>
    if (!user && !loading) return <div>Carregando usuário...</div>

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

    function toggleColaborador(id) {

        setColaboradoresVisiveis(prev => {

            if (prev.includes(id)) {
                return prev.filter(c => c !== id)
            }

            return [...prev, id]
        })
    }

    function getEventosHora(hora) {
        return agendamentos.filter(a => {
            if (!a.inicio || !a.fim) return false

            // 🔥 filtro por colaborador


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

            // DATA DO EVENTO
            const [ano, mes, dia] = a.data.split("-")

            const dataEvento = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia)
            )

            // MESMO DIA SELECIONADO
            const mesmoDia =
                dataEvento.getDate() === data.getDate() &&
                dataEvento.getMonth() === data.getMonth() &&
                dataEvento.getFullYear() === data.getFullYear()

            if (!mesmoDia) return false

            // HORA DO EVENTO
            const [horaEvento, minutoEvento] = a.hora.split(":")

            // SLOT ATUAL
            const [h, m] = hora.split(":")

            // MOSTRA SOMENTE NA LINHA INICIAL
            return (
                Number(horaEvento) === Number(h) &&
                Number(minutoEvento) === Number(m)
            )
        })
    }

    function gerarCalendario() {
        const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
        const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)

        const dias = []

        for (let i = 1; i <= fimMes.getDate(); i++) {
            dias.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i))
        }

        return dias
    }

    function proximoMes() {
        setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }

    function mesAnterior() {
        setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
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

        const fim = new Date(
            inicio.getTime() + Number(duracao) * 60000
        )

        function formatarData(date) {

            const pad = (n) => String(n).padStart(2, "0")

            return (
                date.getFullYear() + "-" +
                pad(date.getMonth() + 1) + "-" +
                pad(date.getDate()) + " " +
                pad(date.getHours()) + ":" +
                pad(date.getMinutes()) + ":00"
            )
        }

        const agendamentosParaSalvar = []
        const inicioStr = formatarData(inicio)
        const fimStr = formatarData(fim)

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
            const agendamentosParaSalvar = []

            const quantidadeRepeticoes = repetir
                ? diasRepeticao
                : 1

            for (let i = 0; i < quantidadeRepeticoes; i++) {

                const novoInicio = new Date(inicio)
                novoInicio.setDate(novoInicio.getDate() + i)

                const novoFim = new Date(fim)
                novoFim.setDate(novoFim.getDate() + i)

                const dataLoop =
                    novoInicio.getFullYear() + "-" +
                    String(novoInicio.getMonth() + 1).padStart(2, "0") + "-" +
                    String(novoInicio.getDate()).padStart(2, "0")

                const horaLoop =
                    String(novoInicio.getHours()).padStart(2, "0") +
                    ":" +
                    String(novoInicio.getMinutes()).padStart(2, "0")

                agendamentosParaSalvar.push({
                    user_id: user.id,
                    empresa_id: empresaId,
                    cliente_id: clienteId,
                    servico_id: servicoId,
                    colaborador_id: colaboradorId,
                    inicio: formatarData(novoInicio),
                    fim: formatarData(novoFim),
                    data: dataLoop,
                    hora: horaLoop,
                    forma_pagamento: formaPagamento,
                    valor: Number(valor),
                    duracao: duracao
                })
            }

            const { error } = await supabase
                .from("agendamentos")
                .insert(agendamentosParaSalvar)

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

                {(perfil?.role === "admin" || perfil?.role === "owner") && (
                    <NavButton href="/colaboradores" pathname={pathname} router={router}>
                        Colaboradores
                    </NavButton>
                )}

                <NavButton href="/servicos" pathname={pathname} router={router}>
                    Serviços
                </NavButton>

                {(perfil?.role === "admin" || perfil?.role === "owner") && (
                    <NavButton
                        href="/financeiro"
                        pathname={pathname}
                        router={router}
                    >
                        Financeiro
                    </NavButton>
                )}

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

                {(perfil?.role === "admin" || perfil?.role === "owner") && (<MobileNavItem
                    icon={<User size={20} />}
                    label="Colab"
                    active={pathname.startsWith("/colaboradores")}
                    onClick={() => router.push("/colaboradores")}
                />
                )}

                <MobileNavItem
                    icon={<Scissors size={20} />}
                    label="Serviços"
                    active={pathname.startsWith("/servicos")}
                    onClick={() => router.push("/servicos")}
                />

                {(perfil?.role === "admin" || perfil?.role === "owner") && (
                    <NavButton
                        href="/financeiro"
                        pathname={pathname}
                        router={router}
                    >
                        Financeiro
                    </NavButton>
                )}

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
                <div className="hidden md:flex w-72 bg-white border-r flex-col p-4 overflow-y-auto">

                    {/* CONFIGURAÇÕES */}
                    <div className="mb-6">

                        <h2 className="text-lg font-semibold mb-4">
                            Configurações
                        </h2>


                        {/* LARGURA */}
                        <div className="mb-6">

                            <div className="flex items-center justify-between mb-2">

                                <span className="text-sm text-gray-600">
                                    Largura das colunas
                                </span>

                                <div className="flex items-center gap-2">

                                    <label className="flex items-center gap-1 text-xs text-gray-500">

                                        <input
                                            type="checkbox"
                                            checked={autoColunas}
                                            onChange={() =>
                                                setAutoColunas(!autoColunas)
                                            }
                                        />

                                        Auto
                                    </label>

                                    {!autoColunas && (
                                        <span className="text-xs text-gray-400">
                                            {larguraColuna}px
                                        </span>
                                    )}

                                </div>

                            </div>

                            {!autoColunas && (
                                <input
                                    type="range"
                                    min="80"
                                    max="260"
                                    value={larguraColuna}
                                    onChange={(e) =>
                                        setLarguraColuna(Number(e.target.value))
                                    }
                                    className="w-full"
                                />
                            )}

                        </div>

                        {/* PROFISSIONAIS */}
                        <div>

                            <div className="text-sm font-medium text-gray-700 mb-3">
                                Profissionais
                            </div>

                            <div className="flex flex-col gap-2">

                                {colaboradores.map(col => (

                                    <label
                                        key={col.id}
                                        className="
                            flex items-center gap-3
                            p-2 rounded-lg
                            hover:bg-gray-100
                            cursor-pointer
                            transition
                        "
                                    >

                                        <input
                                            type="checkbox"
                                            checked={colaboradoresVisiveis.includes(col.id)}
                                            onChange={() => toggleColaborador(col.id)}
                                            className="w-4 h-4"
                                        />

                                        <div
                                            className={`
                                w-3 h-3 rounded-full
                                ${getCorColaborador(col.id)}
                            `}
                                        />

                                        <span className="text-sm">
                                            {col.nome}
                                        </span>

                                    </label>

                                ))}

                            </div>

                        </div>

                    </div>

                    {/* ADS */}
                    <div className="mt-auto bg-gray-300 h-72 flex items-center justify-center rounded">
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
                            className="
        flex items-center gap-6
        px-6 py-3
        rounded-xl
        hover:bg-gray-100
        transition
    "
                        >

                            {/* SETA ESQUERDA */}
                            <span className="text-blue-500 text-2xl">
                                ‹
                            </span>

                            {/* DATA */}
                            <div className="text-3xl font-semibold text-gray-800 capitalize">
                                {data.toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long"
                                })}
                            </div>

                            {/* SETA DIREITA */}
                            <span className="text-blue-500 text-2xl">
                                ›
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

                    <div className="overflow-auto">                        {/* HEADER COLABORADORES */}
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: autoColunas
                                    ? `${larguraHora}px repeat(${colaboradoresVisiveis.length}, minmax(150px, 1fr))`
                                    : `${larguraHora}px repeat(${colaboradoresVisiveis.length}, ${larguraColuna}px)`,
                                width: "max-content"
                            }}
                        >

                            <div></div>
                            {colaboradoresVisiveis.map(id => {

                                const col = colaboradores.find(c => c.id === id)

                                if (!col) return null

                                return (
                                    <div
                                        key={col.id}
                                        className={`text-center font-semibold p-3 text-white ${getCorColaborador(col.id)}`}
                                    >
                                        {col.nome}
                                    </div>
                                )
                            })}
                        </div>


                        {/* LINHAS DE HORÁRIO */}
                        {horas.map(hora => (
                            <div
                                key={hora}
                                className="grid"
                                style={{
                                    gridTemplateColumns: autoColunas
                                        ? `${larguraHora}px repeat(${colaboradoresVisiveis.length}, minmax(150px, 1fr))`
                                        : `${larguraHora}px repeat(${colaboradoresVisiveis.length}, ${larguraColuna}px)`,
                                    width: "max-content"
                                }}
                            >

                                {/* HORA */}
                                <div className="p-2 text-sm text-gray-500 border-r">
                                    {hora}
                                </div>

                                {/* COLUNAS */}
                                {colaboradores
                                    .filter(col => colaboradoresVisiveis.includes(col.id))
                                    .map(col => {
                                        const eventos = getEventosHoraColaborador(hora, col.id)
                                        const ocupado = eventos.length > 0

                                        return (
                                            <div
                                                key={col.id}
                                                className={`relative group h-24 border-r transition ${ocupado ? "bg-gray-50" : "hover:bg-gray-100"}`}
                                                onClick={() => {
                                                    if (!ocupado) {
                                                        // Redireciona para a tela de atendimento
                                                        router.push(
                                                            `/agenda/novo?hora=${encodeURIComponent(hora)}&colaborador=${col.id}&data=${data.toISOString().split("T")[0]}`
                                                        )
                                                    }
                                                }}
                                            >
                                                {!ocupado && (
                                                    <div className="absolute inset-0 hidden group-hover:flex items-center justify-center text-gray-400 text-sm font-medium pointer-events-none">
                                                        Adicionar Agendamento
                                                    </div>
                                                )}
                                                {eventos.map((evt, i) => {

                                                    const altura =
                                                        (Number(evt.duracao || 60) / 30) * 96

                                                    return (

                                                        <div
                                                            key={i}
                                                            style={{
                                                                height: `${altura - 8}px`
                                                            }}
                                                            className={`
                absolute left-1 right-1 top-1
                rounded-lg shadow-sm hover:shadow-md
                transition text-white p-2 text-xs
                cursor-pointer overflow-hidden
                ${getCorColaborador(evt.colaborador_id)}
            `}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                abrirEvento(evt)
                                                            }}
                                                        >

                                                            <div className="font-semibold text-sm leading-tight">
                                                                {getCliente(evt.cliente_id)?.nome}
                                                            </div>

                                                            <div className="text-[12px] opacity-90 mt-1">
                                                                {servicos.find(s => s.id === evt.servico_id)?.nome}
                                                            </div>

                                                            <div className="text-[10px] opacity-80 mt-1">
                                                                {evt.hora}
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

                            <div className="relative mb-3">

                                <input
                                    type="text"
                                    placeholder="Buscar cliente por nome ou telefone..."
                                    value={buscaCliente}
                                    onChange={(e) => {
                                        setBuscaCliente(e.target.value)
                                        setMostrarBuscaCliente(true)
                                    }}
                                    onFocus={() => setMostrarBuscaCliente(true)}
                                    className="w-full border p-3 rounded"
                                />

                                {mostrarBuscaCliente && buscaCliente && (

                                    <div className="
            absolute z-50
            w-full bg-white border rounded-lg shadow-lg
            max-h-60 overflow-y-auto mt-1
        ">

                                        {clientesFiltrados.length === 0 && (
                                            <div className="p-3 text-gray-500">
                                                Nenhum cliente encontrado
                                            </div>
                                        )}

                                        {clientesFiltrados.map(cliente => (

                                            <div
                                                key={cliente.id}
                                                onClick={() => {
                                                    setClienteId(cliente.id)

                                                    setBuscaCliente(
                                                        `${cliente.nome} - ${cliente.telefone || ""}`
                                                    )

                                                    setMostrarBuscaCliente(false)
                                                }}
                                                className="
                        p-3 cursor-pointer
                        hover:bg-gray-100
                        border-b
                    "
                                            >

                                                <div className="font-medium">
                                                    {cliente.nome}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {cliente.telefone}
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                            <div className="relative mb-3">

                                <input
                                    type="text"
                                    placeholder="Buscar profissional..."
                                    value={
                                        colaboradores.find(c => c.id === colaboradorId)?.nome || ""
                                    }
                                    onFocus={() => setMostrarBuscaColaborador(true)}
                                    readOnly
                                    className="w-full border p-3 rounded"
                                />

                                {mostrarBuscaColaborador && (

                                    <div className="
            absolute z-50
            w-full bg-white border rounded-lg shadow-lg
            max-h-60 overflow-y-auto mt-1
        ">

                                        {colaboradores.map(col => (

                                            <div
                                                key={col.id}
                                                onClick={() => {
                                                    setColaboradorId(col.id)
                                                    setMostrarBuscaColaborador(false)
                                                }}
                                                className="
                        p-3 cursor-pointer
                        hover:bg-gray-100
                        border-b
                    "
                                            >

                                                <div className="font-medium">
                                                    {col.nome}
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

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
                                <option value={150}>2h30</option>
                                <option value={180}>3 horas</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Valor (R$)"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full border p-2 mb-3 rounded"
                            />


                            <div className="mb-3 border rounded p-3">

                                <label className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={repetir}
                                        onChange={(e) => setRepetir(e.target.checked)}
                                    />

                                    Repetir atendimento
                                </label>

                                {repetir && (

                                    <div>

                                        <div className="text-sm text-gray-600 mb-1">
                                            Quantos dias repetir
                                        </div>

                                        <input
                                            type="number"
                                            min="1"
                                            value={diasRepeticao}
                                            onChange={(e) =>
                                                setDiasRepeticao(Number(e.target.value))
                                            }
                                            className="w-full border p-2 rounded"
                                        />

                                    </div>

                                )}

                            </div>
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

                            {eventoSelecionado.observacao && (
                                <div className="mb-4">
                                    <strong>Observação:</strong>{" "}
                                    {eventoSelecionado.observacao}
                                </div>
                            )}

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

                            <div className="flex items-center justify-between mb-3">

                                <button
                                    onClick={mesAnterior}
                                    className="px-3 py-1 bg-gray-200 rounded"
                                >
                                    ←
                                </button>

                                <h2 className="font-semibold text-center">
                                    {mesAtual.toLocaleDateString("pt-BR", {
                                        month: "long",
                                        year: "numeric"
                                    })}
                                </h2>

                                <button
                                    onClick={proximoMes}
                                    className="px-3 py-1 bg-gray-200 rounded"
                                >
                                    →
                                </button>

                            </div>

                            <div className="grid grid-cols-7 gap-1 text-sm">
                                {gerarCalendario().map((d, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setData(d)
                                            setMesAtual(d) // 🔥 importante
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
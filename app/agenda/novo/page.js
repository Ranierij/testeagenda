"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Search, User, ChevronRight, X, Plus } from "lucide-react"


export default function Page() {

    return (
        <Suspense fallback={null}>
            <NovoAgendamento />
        </Suspense>
    )
}

function NovoAgendamento() {

    const router = useRouter()
    const { user } = useAuth()

    const searchParams = useSearchParams()

    const [mounted, setMounted] = useState(false)

    const hora = mounted
        ? searchParams.get("hora")
        : null

    const colaborador = mounted
        ? searchParams.get("colaborador")
        : null

    const dataSelecionada = mounted
        ? searchParams.get("data")
        : null

    const [cliente, setCliente] = useState("")
    const [servico, setServico] = useState("")
    const [valor, setValor] = useState("")
    const [duracao, setDuracao] = useState("60")
    const [observacao, setObservacao] = useState("")
    const [repetir, setRepetir] = useState(false)
    const [diasRepeticao, setDiasRepeticao] = useState(30)

    const [clientes, setClientes] = useState([])
    const [servicos, setServicos] = useState([])
    const [colaboradores, setColaboradores] = useState([])

    const [clienteId, setClienteId] = useState("")
    const [buscaCliente, setBuscaCliente] = useState("")
    const [mostrarBuscaCliente, setMostrarBuscaCliente] = useState(false)

    const [modalClientes, setModalClientes] = useState(false)
    const [clienteDetalhe, setClienteDetalhe] = useState(null)
    const [servicoId, setServicoId] = useState("")

    const [mostrarBuscaColaborador, setMostrarBuscaColaborador] = useState(false)
    const [colaboradorId, setColaboradorId] = useState(colaborador || "")



    useEffect(() => {

        if (user) {
            carregarDados()
        }

    }, [user])

    useEffect(() => {

        if (!colaborador || colaboradores.length === 0) return

        const profissional = colaboradores.find(
            c => c.id === colaborador
        )

        if (profissional) {


            setColaboradorId(profissional.id)
        }

    }, [colaborador, colaboradores])

    useEffect(() => {

        if (colaboradores.length > 0 && colaborador) {

            const profissional = colaboradores.find(
                c => c.id === colaborador
            )

            if (profissional) {
                setColaboradorId(profissional.id)
            }
        }

    }, [colaboradores, colaborador])

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null


    async function carregarDados() {

        if (!user) return

        const { data: perfilData } = await supabase
            .from("perfis")
            .select("*")
            .eq("user_id", user.id)
            .single()

        const empresaId = perfilData?.empresa_id



        const { data: colaboradoresData } = await supabase
            .from("colaboradores")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("nome")

        setColaboradores(colaboradoresData || [])

        const { data: clientesData } = await supabase
            .from("clientes")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("nome")

        const { data: servicosData } = await supabase
            .from("servicos")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("nome")



        setClientes(clientesData || [])
        setServicos(servicosData || [])
        setColaboradores(colaboradoresData || [])
    }

    const clientesFiltrados = clientes
        .filter(cliente => {

            const termo = buscaCliente.toLowerCase()

            return (
                cliente.nome?.toLowerCase().includes(termo) ||
                cliente.telefone?.toLowerCase().includes(termo)
            )
        })
        .sort((a, b) => a.nome.localeCompare(b.nome))
    async function salvarAgendamento() {

        if (!clienteId) {
            alert("Selecione o cliente")
            return
        }

        if (!colaboradorId) {
            alert("Selecione o profissional")
            return
        }

        if (!servicoId) {
            alert("Selecione o serviço")
            return
        }

        const { data: perfilData } = await supabase
            .from("perfis")
            .select("*")
            .eq("user_id", user.id)
            .single()

        const empresaId = perfilData?.empresa_id

        const dataFormatada = dataSelecionada

        const [h, m] = hora.split(":")

        const [ano, mes, dia] = dataSelecionada.split("-")

        const inicio = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
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

        // AGENDAMENTO ORIGINAL
        agendamentosParaSalvar.push({
            empresa_id: empresaId,
            cliente_id: clienteId,
            colaborador_id: colaboradorId,
            servico_id: servicoId,
            inicio: formatarData(inicio),
            fim: formatarData(fim),
            valor: Number(valor),
            duracao: Number(duracao),
            observacao,
            data: dataFormatada,
            hora
        })

        // REPETIÇÃO FUTURA
        if (repetir) {

            const novoInicio = new Date(inicio)
            novoInicio.setDate(novoInicio.getDate() + diasRepeticao)

            const novoFim = new Date(fim)
            novoFim.setDate(novoFim.getDate() + diasRepeticao)

            const dataLoop =
                novoInicio.getFullYear() + "-" +
                String(novoInicio.getMonth() + 1).padStart(2, "0") + "-" +
                String(novoInicio.getDate()).padStart(2, "0")

            const horaLoop =
                String(novoInicio.getHours()).padStart(2, "0") +
                ":" +
                String(novoInicio.getMinutes()).padStart(2, "0")

            agendamentosParaSalvar.push({
                empresa_id: empresaId,
                cliente_id: clienteId,
                colaborador_id: colaboradorId,
                servico_id: servicoId,
                inicio: formatarData(novoInicio),
                fim: formatarData(novoFim),
                valor: Number(valor),
                duracao: Number(duracao),
                observacao,
                data: dataLoop,
                hora: horaLoop
            })
        }

        const { error } = await supabase
            .from("agendamentos")
            .insert(agendamentosParaSalvar)

        if (error) {

            console.log(error)

            alert("Erro ao salvar")

            return
        }

        alert("Agendamento criado!")

        router.push("/agenda")
    }


    return (

        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-8">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-8">

                    <button
                        onClick={() => router.back()}
                        className="text-2xl"
                    >
                        ←
                    </button>

                    <h1 className="text-2xl font-semibold">
                        Atendimento
                    </h1>

                </div>

                {/* CLIENTE */}
                <div className="mb-6">

                    <label className="block text-sm mb-2">
                        Cliente
                    </label>

                    <div className="relative mb-3">

                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={buscaCliente}
                            readOnly
                            onClick={() => setModalClientes(true)}
                            className="w-full border p-3 rounded-xl cursor-pointer"
                        />


                    </div>

                </div>


                {/* PROFISSIONAL */}
                {/* PROFISSIONAL */}
                <div className="mb-6">

                    <label className="block text-sm mb-2">
                        Profissional
                    </label>

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() =>
                                setMostrarBuscaColaborador(!mostrarBuscaColaborador)
                            }
                            className="
                w-full
                border
                rounded-xl
                p-3
                flex items-center justify-between
                bg-white
            "
                        >

                            <span>

                                {
                                    colaboradores.find(c => c.id === colaboradorId)?.nome
                                    || "Selecione o profissional"
                                }

                            </span>

                            <span className="text-gray-400">
                                ▼
                            </span>

                        </button>

                        {mostrarBuscaColaborador && (

                            <div className="
                absolute z-50
                w-full
                bg-white
                border
                rounded-xl
                shadow-lg
                mt-1
                overflow-hidden
            ">

                                {colaboradores.map(col => (

                                    <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => {

                                            setColaboradorId(col.id)

                                            setMostrarBuscaColaborador(false)
                                        }}
                                        className="
                            w-full text-left
                            p-3
                            hover:bg-gray-100
                            border-b
                        "
                                    >

                                        {col.nome}

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

                {/* SERVIÇO */}
                <div className="mb-6">

                    <label className="block text-sm mb-2">
                        Serviço
                    </label>

                    <select
                        value={servicoId}
                        onChange={(e) => {

                            const id = e.target.value

                            setServicoId(id)

                            const servicoSelecionado = servicos.find(
                                s => s.id === id
                            )

                            if (servicoSelecionado) {

                                setValor(servicoSelecionado.valor || "")

                                setDuracao(
                                    String(servicoSelecionado.duracao || 60)
                                )
                            }

                        }}
                        className="
        w-full
        border
        rounded-xl
        p-3
    "
                    >

                        <option value="">
                            Selecione o serviço
                        </option>

                        {servicos.map(servico => (
                            <option
                                key={servico.id}
                                value={servico.id}
                            >
                                {servico.nome}
                            </option>
                        ))}

                    </select>

                </div>

                {/* HORA + DURAÇÃO */}
                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div>

                        <label className="block text-sm mb-2">
                            Horário
                        </label>

                        <input
                            type="text"
                            value={hora || ""}
                            disabled
                            className="
                                w-full
                                border
                                rounded-xl
                                p-3
                                bg-gray-100
                            "
                        />

                    </div>

                    <div>

                        <label className="block text-sm mb-2">
                            Duração
                        </label>

                        <select
                            value={duracao}
                            onChange={(e) => setDuracao(e.target.value)}
                            className="
                                w-full
                                border
                                rounded-xl
                                p-3
                            "
                        >
                            <option value="30">30 min</option>
                            <option value="60">1 hora</option>
                            <option value="90">1h30</option>
                            <option value="120">2 horas</option>
                            <option value="150">2h30</option>
                            <option value="180">3 horas</option>
                        </select>

                    </div>

                </div>

                {/* VALOR */}
                <div className="mb-6">

                    <label className="block text-sm mb-2">
                        Valor
                    </label>

                    <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="R$ 0,00"
                        className="
                            w-full
                            border
                            rounded-xl
                            p-3
                        "
                    />

                </div>

                {/* OBS */}
                <div className="mb-6">

                    <label className="block text-sm mb-2">
                        Observação
                    </label>

                    <textarea
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        placeholder="Observação"
                        className="
                            w-full
                            border
                            rounded-xl
                            p-3
                            h-28
                            resize-none
                        "
                    />

                </div>

                {/* REPETIR */}
                <div className="mt-6">

                    <div className="flex items-center justify-between">

                        <span className="text-pink-500 font-medium">
                            Repetir atendimento
                        </span>

                        <button
                            type="button"
                            onClick={() => setRepetir(!repetir)}
                            className={`
                w-12 h-6 rounded-full transition relative
                ${repetir ? "bg-pink-500" : "bg-gray-300"}
            `}
                        >
                            <div
                                className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                    ${repetir ? "left-7" : "left-1"}
                `}
                            />
                        </button>

                    </div>

                    {repetir && (

                        <div className="mt-4">

                            <label className="text-sm text-gray-600">
                                Repetir por quantos dias?
                            </label>

                            <select
                                value={diasRepeticao}
                                onChange={(e) => setDiasRepeticao(Number(e.target.value))}
                                className="w-full border rounded p-2 mt-1"
                            >
                                <option value={7}>7 dias</option>
                                <option value={15}>14 dias</option>
                                <option value={30}>28 dias</option>
                                <option value={45}>45 dias</option>
                            </select>

                        </div>

                    )}

                </div>



                {/* BOTÃO */}
                <button
                    onClick={salvarAgendamento}
                    className="
        mt-8
        w-full
        bg-pink-600
        hover:bg-pink-700
        transition
        text-white
        font-semibold
        p-4
        rounded-xl
    "
                >
                    SALVAR
                </button>


            </div>

            {/* MODAL CLIENTES */}
            {modalClientes && (

                <div className="
                fixed inset-0 z-[99999]
                bg-black/40
                flex items-center justify-center
            ">

                    <div className="
                    bg-white
                    w-[95%]
                    max-w-md
                    h-[80vh]
                    rounded-2xl
                    overflow-hidden
                    flex flex-col
                ">

                        {/* TOPO */}
                        <div className="
                        flex items-center gap-3
                        border-b p-4
                    ">

                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar Cliente..."
                                value={buscaCliente}
                                onChange={(e) => setBuscaCliente(e.target.value)}
                                className="
                                flex-1
                                border rounded-lg
                                p-2
                            "
                            />

                            <button
                                onClick={() => setModalClientes(false)}
                                className="text-2xl text-gray-500"
                            >
                                ×
                            </button>

                        </div>

                        {/* LISTA */}
                        <div className="flex-1 overflow-y-auto">

                            {clientesFiltrados.map(cliente => (

                                <div
                                    key={cliente.id}
                                    className="
                                    flex items-center justify-between
                                    p-4 border-b
                                    hover:bg-gray-50
                                "
                                >

                                    <div
                                        onClick={() => {

                                            setClienteId(cliente.id)

                                            setBuscaCliente(cliente.nome)

                                            setModalClientes(false)
                                        }}
                                        className="font-medium cursor-pointer text-pink-500"
                                    >
                                        {cliente.nome}
                                    </div>

                                    <div className="flex items-center gap-4">

                                        <button
                                            onClick={() => {
                                                router.push(`/clientes/${cliente.id}`)
                                            }}
                                            className="text-pink-500"
                                        >
                                            <User size={24} />
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            )}
        </div>
    )
}
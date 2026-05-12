"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import DatePicker, { registerLocale } from "react-datepicker"
import ptBR from "date-fns/locale/pt-BR"
import "react-datepicker/dist/react-datepicker.css"

registerLocale("pt-BR", ptBR)


export default function NovoCliente() {

    const router = useRouter()

    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const [nascimento, setNascimento] = useState(null)
    const [busca, setBusca] = useState("")

    const [clientes, setClientes] = useState([])
    const [modalNovo, setModalNovo] = useState(false)
    const [endereco, setEndereco] = useState("")
    const [menuAberto, setMenuAberto] = useState(null)

    const [numero, setNumero] = useState("")
    const [cep, setCep] = useState("")
    const [bairro, setBairro] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")

    useEffect(() => {
        carregarClientes()
    }, [])

    async function carregarClientes() {

        const { data, error } = await supabase
            .from("clientes")
            .select("*")
            .order("nome")

        if (error) {
            console.log(error)
            return
        }

        console.log("CLIENTES:", data)

        setClientes(data || [])
    }

    async function salvar() {
        const { data } = await supabase.auth.getSession()
        console.log("SESSION:", data)

        console.log("SALVAR CLICADO")

        if (!nome) {
            alert("Nome obrigatório")
            return
        }



        // 🔥 pega usuário de forma segura
        const { data: authData, error: authError } = await supabase.auth.getUser()

        console.log("AUTH DATA:", authData)
        console.log("AUTH ERROR:", authError)

        if (authError || !authData?.user?.id) {
            alert("Usuário não logado")
            return
        }

        const userId = authData.user.id

        const nascimentoFormatado = nascimento
            ? nascimento.toISOString().split("T")[0]
            : null

        const { data: existente } = await supabase
            .from("clientes")
            .select("*")
            .eq("telefone", telefone)
            .maybeSingle()

        if (existente) {
            alert("Cliente já cadastrado com esse telefone")
            return
        }



        const { error } = await supabase.from("clientes").insert({
            nome,
            telefone,
            nascimento: nascimentoFormatado,
            //cpf,//
            //endereco,
            // numero,
            //cep,
            // bairro,
            // cidade,
            //estado,
            user_id: authData.user.id
        })

        console.log("ERRO SUPABASE:", error)

        if (error) {
            alert(error.message)
            return
        }

        alert("Salvou com sucesso")

        router.push("/agenda")
        router.refresh()
    }

    function editar(cliente) {

        setNome(cliente.nome || "")
        setTelefone(cliente.telefone || "")

        if (cliente.nascimento) {
            setNascimento(new Date(cliente.nascimento))
        }

        setMenuAberto(null)

        router.push(`/clientes/${cliente.id}`)
    }

    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome?.toLowerCase().includes(
            busca.toLowerCase()
        )
    )

    return (
        <div className="min-h-screen bg-white">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">

                {/* ESQUERDA */}
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => router.push("/agenda")}
                        className="
                w-10 h-10
                rounded-full
                hover:bg-gray-100
                transition
                flex items-center justify-center
                text-xl
            "
                    >
                        ←
                    </button>

                    <h1 className="text-2xl font-semibold">
                        Clientes
                    </h1>

                </div>

                {/* DIREITA */}
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => router.push("/clientes/novo")}
                        className="
                w-10 h-10
                rounded-full
                bg-black
                text-white
                text-2xl
                flex items-center justify-center
            "
                    >
                        +
                    </button>

                </div>

            </div>

            {/* BARRA BUSCA */}
            <div className="flex items-center gap-4 px-6 py-3 border-b">

                <select className="border rounded px-3 py-2 text-sm">
                    <option>Todos os Clientes</option>
                </select>

                <input
                    type="text"
                    placeholder="Procurar por nome, telefone ou CPF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="
                    flex-1
                    border
                    rounded
                    px-4
                    py-2
                    text-sm
                    outline-none
                "
                />

            </div>

            {/* LISTA */}
            <div>

                {clientesFiltrados.map(cliente => (

                    <div
                        key={cliente.id}
                        className="
        relative
        flex items-center justify-between
        px-6 py-4
        border-b
        hover:bg-gray-50
        transition
    "
                    >

                        <div className="flex items-center gap-4">

                            <input type="checkbox" />

                            <div
                                className="
                                w-10 h-10
                                rounded-full
                                bg-gray-200
                            "
                            />

                            <div>

                                <div className="font-medium text-pink-500">
                                    {cliente.nome}
                                </div>

                            </div>

                        </div>

                        <button
                            onClick={() => {
                                if (menuAberto === cliente.id) {
                                    setMenuAberto(null)
                                } else {
                                    setMenuAberto(cliente.id)
                                }
                            }}
                            className="p-2"
                        >
                            ⋮
                        </button>
                        {menuAberto === cliente.id && (
                            <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50">

                                <button
                                    onClick={() => router.push(`/clientes/${cliente.id}`)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => excluir(cliente.id)}
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                >
                                    Excluir
                                </button>

                            </div>
                        )}

                    </div>

                ))}

            </div>

        </div>
    )
}
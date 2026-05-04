"use client"

import { useState } from "react"
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
    const [cpf, setCpf] = useState("")

    const [endereco, setEndereco] = useState("")
    const [numero, setNumero] = useState("")
    const [cep, setCep] = useState("")
    const [bairro, setBairro] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")

    async function salvar() {

        console.log("SALVAR CLICADO")

        if (!nome) {
            alert("Nome obrigatório")
            return
        }

        // 🔥 pega usuário corretamente
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData?.user?.id) {
            alert("Usuário não logado")
            return
        }

        const userId = authData.user.id

        // 🔥 formata data (se existir)
        const nascimentoFormatado = nascimento
            ? nascimento.toISOString().split("T")[0]
            : null

        // 🔥 evita duplicidade
        const { data: existente } = await supabase
            .from("clientes")
            .select("id")
            .eq("telefone", telefone)
            .eq("user_id", userId)
            .maybeSingle()

        if (existente) {
            alert("Cliente já cadastrado com esse telefone")
            return
        }

        // 🔥 INSERT
        const { error } = await supabase.from("clientes").insert({
            nome,
            telefone,
            nascimento: nascimentoFormatado,
            cpf,
            endereco,
            numero,
            cep,
            bairro,
            cidade,
            estado,
            user_id: userId
        })

        if (error) {
            console.error("ERRO SUPABASE:", error)
            alert(error.message)
            return
        }

        alert("Salvou com sucesso")

        router.push("/clientes") // 🔥 volta pra lista
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 space-y-4">

                {/* HEADER */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition group"
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
                        Novo Cliente
                    </h1>

                    <div className="w-10" />
                </div>

                {/* FORM */}
                <div className="space-y-4">

                    <h2 className="text-sm font-semibold text-gray-500 uppercase">
                        Informações pessoais
                    </h2>

                    <input
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Telefone"
                        value={telefone}
                        onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "")

                            if (v.length > 11) v = v.slice(0, 11)

                            if (v.length > 6)
                                v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
                            else if (v.length > 2)
                                v = `(${v.slice(0, 2)}) ${v.slice(2)}`

                            setTelefone(v)
                        }}
                        className="w-full border p-3 rounded-lg"
                    />

                    <DatePicker
                        selected={nascimento}
                        onChange={(date) => setNascimento(date)}
                        locale="pt-BR"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Data de nascimento"
                        className="w-full border p-3 rounded-lg"
                    />

                </div>

                {/* BOTÃO */}
                <button
                    onClick={salvar}
                    className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                    Salvar
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Seus dados são protegidos conforme a política de privacidade
                </p>

            </div>
        </div>
    )
}
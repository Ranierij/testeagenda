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
            //nascimento: nascimentoFormatado,
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



    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">

            <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 space-y-4">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.back()}>
                        ←
                    </button>

                    <h1 className="text-xl font-bold text-gray-800">
                        Novo Cliente
                    </h1>

                </div>

                {/* FORM */}
                <div className="space-y-4">

                    <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
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
                            else
                                v = v

                            setTelefone(v)
                        }}
                        className="w-full border p-2 mb-3 rounded"
                    />






                </div>

                {/* BOTÃO EMBAIXO */}
                <button
                    onClick={salvar}
                    className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 active:scale-95 transition"                >
                    Salvar
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Seus dados são protegidos conforme a política de privacidade
                </p>

            </div>
        </div>
    )
}
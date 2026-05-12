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

    async function salvar() {

        if (!nome) {
            alert("Nome obrigatório")
            return
        }

        const { data: authData, error: authError } =
            await supabase.auth.getUser()

        if (authError || !authData?.user?.id) {
            alert("Usuário não logado")
            return
        }

        const nascimentoFormatado = nascimento
            ? nascimento.toISOString().split("T")[0]
            : null

        const { data: perfil } = await supabase
            .from("perfis")
            .select("empresa_id")
            .eq("user_id", authData.user.id)
            .single()

        const { error } = await supabase
            .from("clientes")
            .insert({
                nome,
                telefone,
                nascimento: nascimentoFormatado,
                user_id: authData.user.id,
                empresa_id: perfil.empresa_id
            })

        if (error) {
            console.log(error)
            alert(error.message)
            return
        }

        alert("Cliente cadastrado")

        router.push("/clientes")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between mb-6">

                    <button
                        onClick={() => router.push("/clientes")}
                        className="text-xl"
                    >
                        ←
                    </button>

                    <h1 className="text-xl font-semibold">
                        Novo Cliente
                    </h1>

                    <div />
                </div>

                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border rounded p-3 mb-4"
                />

                <input
                    type="text"
                    placeholder="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full border rounded p-3 mb-4"
                />

                <div className="mb-4">

                    <DatePicker
                        selected={nascimento}
                        onChange={(date) => setNascimento(date)}
                        locale="pt-BR"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Nascimento"
                        className="w-full border rounded p-3"
                    />

                </div>

                <button
                    onClick={salvar}
                    className="
                        w-full
                        bg-pink-500
                        text-white
                        p-3
                        rounded-lg
                    "
                >
                    Salvar Cliente
                </button>

            </div>

        </div>
    )
}
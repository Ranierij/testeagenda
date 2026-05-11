"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function EditarColaborador() {

    const params = useParams()
    const router = useRouter()

    const [nome, setNome] = useState("")

    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {

        const { data } = await supabase
            .from("colaboradores")
            .select("*")
            .eq("id", params.id)
            .single()

        if (data) {
            setNome(data.nome || "")
        }
    }

    async function salvar() {

        await supabase
            .from("colaboradores")
            .update({
                nome
            })
            .eq("id", params.id)

        alert("Colaborador atualizado!")

        router.push("/colaboradores")
    }

    return (

        <div className="min-h-screen bg-gray-100 p-6">

            <div className="
                max-w-xl mx-auto
                bg-white
                rounded-3xl
                p-6
                shadow-sm
            ">

                <h1 className="text-2xl font-semibold mb-6">
                    Editar Colaborador
                </h1>

                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    className="
                        w-full border rounded-xl
                        p-3 mb-6
                    "
                />

                <button
                    onClick={salvar}
                    className="
                        w-full
                        bg-pink-500
                        text-white
                        p-4
                        rounded-xl
                        font-semibold
                    "
                >
                    SALVAR
                </button>

            </div>

        </div>

    )
}
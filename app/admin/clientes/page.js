'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
    const [dados, setDados] = useState([])

    useEffect(() => {
        carregar()
    }, [])

    const carregar = async () => {
        const { data } = await supabase
            .from('assinaturas')
            .select('*')

        setDados(data || [])
    }

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    const ativarPlano = async (id) => {
        const novaData = new Date()
        novaData.setDate(novaData.getDate() + 30)

        await supabase
            .from('assinaturas')
            .update({
                status: 'ativo',
                data_expiracao: novaData
            })
            .eq('id', id)

        carregar()
    }

    const desativarPlano = async (id) => {
        await supabase
            .from('assinaturas')
            .update({
                status: 'inativo'
            })
            .eq('id', id)

        carregar()
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Painel Admin 💰</h1>

            <div className="bg-white shadow rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">User ID</th>
                            <th className="p-3">Plano</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Expira</th>
                            <th className="p-3">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dados.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">{item.user_id}</td>
                                <td className="p-3">{item.plano}</td>
                                <td className="p-3">
                                    <span className={
                                        item.status === 'ativo'
                                            ? 'text-green-600'
                                            : 'text-red-500'
                                    }>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {formatarData(item.data_expiracao)}
                                </td>
                                <td className="p-3 flex gap-2 justify-center">

                                    <button
                                        onClick={() => ativarPlano(item.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Ativar
                                    </button>

                                    <button
                                        onClick={() => desativarPlano(item.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Bloquear
                                    </button>

                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}
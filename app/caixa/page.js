'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Caixa() {
    const [resumo, setResumo] = useState({})

    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {
        const { data: { user } } = await supabase.auth.getUser()

        const mesAtual = new Date().toISOString().slice(0, 7)

        const { data } = await supabase
            .from('agendamentos')
            .select(`servicos(preco), profissionais(nome, comissao)`)
            .eq('user_id', user.id)
            .eq('status', 'confirmado')
            .like('data', `${mesAtual}%`)

        let total = 0
        let profissionais = {}

        data.forEach(a => {
            const valor = a.servicos?.preco || 0
            const comissao = valor * ((a.profissionais?.comissao || 0) / 100)
            const nome = a.profissionais?.nome || 'Sem nome'

            total += valor

            if (!profissionais[nome]) {
                profissionais[nome] = { total: 0, comissao: 0 }
            }

            profissionais[nome].total += valor
            profissionais[nome].comissao += comissao
        })

        setResumo({ total, profissionais })
    }

    async function fecharCaixa() {
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('caixa').insert({
            data: new Date().toISOString(),
            total: resumo.total,
            detalhes: resumo.profissionais,
            user_id: user.id
        })

        alert('Caixa fechado!')
    }

    return (
        <div className="p-4">
            <h1>Caixa 💰</h1>

            <div>Total: R$ {resumo.total || 0}</div>

            <button onClick={fecharCaixa}>
                Fechar Caixa
            </button>

            {resumo.profissionais && Object.entries(resumo.profissionais).map(([nome, d]) => (
                <div key={nome}>
                    {nome} - R$ {d.comissao}
                </div>
            ))}
        </div>
    )
}
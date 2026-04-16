'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Profissionais() {
    const [lista, setLista] = useState([])
    const [nome, setNome] = useState('')
    const [comissao, setComissao] = useState('')

    useEffect(() => {
        init()
    }, [])

    async function init() {
        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase
            .from('profissionais')
            .select('*')
            .eq('user_id', user.id)

        setLista(data || [])
    }

    async function adicionar() {
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('profissionais').insert({
            nome,
            comissao: Number(comissao),
            user_id: user.id
        })

        setNome('')
        setComissao('')
        init()
    }

    return (
        <div className="p-4">
            <h1>Profissionais 💇‍♀️</h1>

            <input placeholder="Nome" onChange={e => setNome(e.target.value)} />
            <input placeholder="% Comissão" onChange={e => setComissao(e.target.value)} />

            <button onClick={adicionar}>Adicionar</button>

            {lista.map(p => (
                <div key={p.id}>
                    {p.nome} - {p.comissao}%
                </div>
            ))}
        </div>
    )
}
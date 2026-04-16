'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Servicos() {
    const [lista, setLista] = useState([])
    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState('')

    useEffect(() => {
        carregar()
    }, [])

    const carregar = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase
            .from('servicos')
            .select('*')
            .eq('user_id', user.id)

        setLista(data || [])
    }

    const adicionar = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('servicos').insert({
            nome,
            preco: Number(preco),
            user_id: user.id
        })

        setNome('')
        setPreco('')
        carregar()
    }

    return (
        <div className="p-4 flex flex-col gap-2">
            <h1>Serviços 💅</h1>

            <input placeholder="Nome" onChange={e => setNome(e.target.value)} />
            <input placeholder="Preço" onChange={e => setPreco(e.target.value)} />

            <button onClick={adicionar}>Adicionar</button>

            {lista.map(s => (
                <div key={s.id}>
                    {s.nome} - R$ {s.preco}
                </div>
            ))}
        </div>
    )
}
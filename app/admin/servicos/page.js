'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Servicos() {
    const [lista, setLista] = useState([])
    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState('')
    const [duracao, setDuracao] = useState('')

    useEffect(() => {
        init()
    }, [])

    async function init() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return window.location.href = '/login'

        const { data } = await supabase
            .from('servicos')
            .select('*')
            .eq('user_id', user.id)

        setLista(data || [])
    }

    async function adicionar() {
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('servicos').insert({
            nome,
            preco: Number(preco),
            duracao: Number(duracao),
            user_id: user.id
        })

        setNome('')
        setPreco('')
        setDuracao('')
        init()
    }

    async function atualizar(id, campo, valor) {
        await supabase.from('servicos').update({ [campo]: valor }).eq('id', id)
        init()
    }

    async function excluir(id) {
        await supabase.from('servicos').delete().eq('id', id)
        init()
    }

    return (
        <div className="p-4">
            <h1>Serviços 💅</h1>

            <input placeholder="Nome" onChange={e => setNome(e.target.value)} />
            <input placeholder="Preço" onChange={e => setPreco(e.target.value)} />
            <input placeholder="Duração" onChange={e => setDuracao(e.target.value)} />

            <button onClick={adicionar}>Adicionar</button>

            {lista.map(s => (
                <div key={s.id}>
                    <input value={s.nome} onChange={e => atualizar(s.id, 'nome', e.target.value)} />
                    <input value={s.preco} onChange={e => atualizar(s.id, 'preco', Number(e.target.value))} />
                    <input value={s.duracao} onChange={e => atualizar(s.id, 'duracao', Number(e.target.value))} />
                    <button onClick={() => excluir(s.id)}>Excluir</button>
                </div>
            ))}
        </div>
    )
}
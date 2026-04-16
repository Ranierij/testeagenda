'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Historico() {
    const [lista, setLista] = useState([])

    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {
        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase
            .from('caixa')
            .select('*')
            .eq('user_id', user.id)
            .order('data', { ascending: false })

        setLista(data || [])
    }

    return (
        <div className="p-4">
            <h1>Histórico 📊</h1>

            {lista.map(c => (
                <div key={c.id}>
                    {new Date(c.data).toLocaleString()} - R$ {c.total}
                </div>
            ))}
        </div>
    )
}
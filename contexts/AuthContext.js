"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 🔥 pega sessão atual
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
            setLoading(false)
        })

        // 🔥 escuta mudanças
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "SIGNED_OUT") {
                    setUser(null)
                }

                if (event === "SIGNED_IN") {
                    setUser(session?.user ?? null)
                }

                if (event === "TOKEN_REFRESH_FAILED") {
                    supabase.auth.signOut()
                    setUser(null)
                }
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
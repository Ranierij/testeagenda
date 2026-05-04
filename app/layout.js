"use client"

import './globals.css'

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { AuthProvider } from "@/contexts/AuthContext" // 👈 ADICIONA ISSO

export default function RootLayout({ children }) {
    const pathname = usePathname()

    return (
        <html lang="pt-BR">
            <body>

                <AuthProvider> {/* 👈 ENVOLVE TUDO */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </AuthProvider>

            </body>
        </html>
    )
}
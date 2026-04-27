"use client";

import { useRouter } from "next/navigation";

export default function BotaoVoltar({ voltar = false }) {
    const router = useRouter();

    function handleClick() {
        if (voltar) {
            router.back();
        } else {
            router.push("/agenda");
        }
    }

    return (
        <button onClick={handleClick} className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition group active:scale-95">
            <svg
                className="w-5 h-5 stroke-gray-700 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
        </button>
    );
}
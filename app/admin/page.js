export default function AdminHome() {
    return (
        <div className="p-4 flex flex-col gap-2">

            <h1 className="text-xl font-bold">Admin ⚙️</h1>

            <a href="/admin/servicos" className="bg-pink-500 text-white p-2 rounded">
                Serviços
            </a>

            <a href="/admin/clientes" className="bg-blue-500 text-white p-2 rounded">
                Clientes
            </a>

            <a href="/admin/profissionais" className="bg-purple-500 text-white p-2 rounded">
                Profissionais
            </a>

            <a href="/caixa" className="bg-green-500 text-white p-2 rounded">
                Caixa
            </a>

        </div>
    )
}
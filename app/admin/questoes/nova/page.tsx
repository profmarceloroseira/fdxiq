import FormularioQuestao from "@/components/FormularioQuestao";

export default function NovaQuestaoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</a>
          <h1 className="text-lg font-bold text-gray-800">Nova questão</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <FormularioQuestao />
        </div>
      </div>
    </div>
  );
}

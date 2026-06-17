import { Suspense } from "react";
import MontadorProva from "@/components/MontadorProva";

export default function ProvaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>}>
      <MontadorProva />
    </Suspense>
  );
}

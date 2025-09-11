import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Valvula } from "@/types/db";
import { listValvulas, deleteValvula } from "@/services/valvulasService";
import { NovaValvulaDialog } from "@/components/NovaValvulaDialog";

export default function ValvulasManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<Valvula[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async (search?: string) => {
    setLoading(true);
    try {
      const data = await listValvulas(search);
      setRows(data);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar válvulas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const count = useMemo(() => rows.length, [rows]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData(q);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Remover esta válvula?")) return;
    await deleteValvula(id);
    await fetchData(q);
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")} // mude para "/" se preferir voltar ao início
            className="rounded-xl border px-4 py-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold">Gestão de Válvulas</h1>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-black px-4 py-2 font-medium text-white"
        >
          + Nova Válvula
        </button>
      </div>

      {/* busca */}
      <form onSubmit={onSearch} className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por TAG, fabricante, modelo ou nº de série…"
          className="w-full rounded-xl border p-3"
        />
      </form>

      {/* tabela */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">TAG</th>
              <th className="px-4 py-3 text-left">Fabricante</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Nº Série</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Localização</th>
              <th className="px-4 py-3 text-left">Próxima Inspeção</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6" colSpan={8}>
                  Carregando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6" colSpan={8}>
                  Nenhuma válvula encontrada.
                </td>
              </tr>
            ) : (
              rows.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{v.tag}</td>
                  <td className="px-4 py-3">{v.fabricante ?? "-"}</td>
                  <td className="px-4 p

import type { Valvula } from "@/types/db";
import { listValvulas, deleteValvula } from "@/services/valvulasService";
import { NovaValvulaDialog } from "@/components/NovaValvulaDialog";
import { useNavigate } from "react-router-dom";


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

useEffect(() => { fetchData(); }, []);

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
<div className="mb-6 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
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


      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
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


<form onSubmit={onSearch} className="mb-4">
<input
value={q}

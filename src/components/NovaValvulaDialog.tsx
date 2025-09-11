import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateValvulaDTO, Empresa, Planta } from '../types/db';
import { createValvula, listEmpresas, listPlantas } from '../services/valvulasService';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // recarregar lista
};

export function NovaValvulaDialog({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<CreateValvulaDTO>({
      defaultValues: {
        fabricante: 'LESER',
        status: 'ativa',
        periodicidade_meses: 12,
      },
    });

  const empresa_id = watch('empresa_id');

  useEffect(() => {
    if (!open) return;
    (async () => {
      const es = await listEmpresas();
      setEmpresas(es);
    })();
  }, [open]);

  useEffect(() => {
    (async () => {
      const ps = await listPlantas(empresa_id || undefined);
      setPlantas(ps);
    })();
  }, [empresa_id]);

  if (!open) return null;

  const onSubmit = async (values: CreateValvulaDTO) => {
    try {
      setSaving(true);
      await createValvula(values);
      reset();
      onCreated();
      onClose();
    } catch (e: any) {
      alert(e?.message ?? 'Erro ao salvar válvula');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Nova Válvula</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">TAG *</label>
            <input className="mt-1 w-full rounded-lg border p-2" {...register('tag', { required: 'Informe a TAG' })} />
            {errors.tag && <p className="text-sm text-red-600">{errors.tag.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Fabricante</label>
            <input className="mt-1 w-full rounded-lg border p-2" {...register('fabricante')} />
          </div>

          <div>
            <label className="block text-sm font-medium">Modelo</label>
            <input className="mt-1 w-full rounded-lg border p-2" {...register('modelo')} />
          </div>

          <div>
            <label className="block text-sm font-medium">Nº de Série</label>
            <input className="mt-1 w-full rounded-lg border p-2" {...register('numero_serie')} />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select className="mt-1 w-full rounded-lg border p-2" {...register('status')}>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="manutencao">Manutenção</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Localização</label>
            <input className="mt-1 w-full rounded-lg border p-2" {...register('localizacao')} />
          </div>

          <div>
            <label className="block text-sm font-medium">Próxima Inspeção</label>
            <input type="date" className="mt-1 w-full rounded-lg border p-2" {...register('proxima_inspecao')} />
          </div>

          <div>
            <label className="block text-sm font-medium">Periodicidade (meses)</label>
            <input type="number" className="mt-1 w-full rounded-lg border p-2" {...register('periodicidade_meses', { valueAsNumber: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium">Empresa</label>
            <select className="mt-1 w-full rounded-lg border p-2" {...register('empresa_id')}>
              <option value="">—</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Planta</label>
            <select className="mt-1 w-full rounded-lg border p-2" {...register('planta_id')}>
              <option value="">—</option>
              {plantas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium">Observações</label>
            <textarea rows={3} className="mt-1 w-full rounded-lg border p-2" {...register('observacoes')} />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 md:col-span-3">
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">Cancelar</button>
            <button disabled={saving} className="rounded-xl bg-black px-4 py-2 font-medium text-white">
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

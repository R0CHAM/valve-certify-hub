import { supabase } from '../lib/supabaseClient';
import type { Valvula, CreateValvulaDTO, Empresa, Planta } from '../types/db';

const TBL = 'valvulas';

export async function listValvulas(search?: string) {
  let q = supabase.from(TBL).select('*').order('created_at', { ascending: false });

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    q = q.or(`tag.ilike.${s},fabricante.ilike.${s},modelo.ilike.${s},numero_serie.ilike.${s}`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Valvula[];
}

export async function createValvula(payload: CreateValvulaDTO) {
  // Envie apenas campos preenchidos
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== '')
  );

  const { data, error } = await supabase
    .from(TBL)
    .insert([clean])
    .select('*')
    .single();

  if (error) throw error;
  return data as Valvula;
}

export async function deleteValvula(id: string) {
  const { error } = await supabase.from(TBL).delete().eq('id', id);
  if (error) throw error;
}

// Auxiliares para selects
export async function listEmpresas() {
  const { data, error } = await supabase.from('empresas').select('id,nome').order('nome');
  if (error) throw error;
  return (data ?? []) as Empresa[];
}

export async function listPlantas(empresaId?: string) {
  let q = supabase.from('plantas').select('id,nome,empresa_id').order('nome');
  if (empresaId) q = q.eq('empresa_id', empresaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Planta[];
}

export type Empresa = {
  id: string;
  nome: string;
};

export type Planta = {
  id: string;
  nome: string;
  empresa_id: string | null;
};

export type Valvula = {
  id: string;
  tag: string;
  empresa_id?: string | null;
  planta_id?: string | null;
  modelo?: string | null;
  fabricante?: string | null;
  numero_serie?: string | null;
  localizacao?: string | null;
  status?: string | null;              // enum no DB (default 'ativa')
  periodicidade_meses?: number | null; // default 12
  proxima_inspecao?: string | null;    // yyyy-mm-dd
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateValvulaDTO = Omit<Valvula, 'id' | 'created_at' | 'updated_at'> & {
  tag: string;
};

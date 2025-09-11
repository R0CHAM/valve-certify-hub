-- Expandir tabela de válvulas com campos técnicos detalhados
ALTER TABLE public.valvulas 
ADD COLUMN IF NOT EXISTS numero_job_reparo text,
ADD COLUMN IF NOT EXISTS numero_proposta text,
ADD COLUMN IF NOT EXISTS selo_asme boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS simbolo_nb text,
ADD COLUMN IF NOT EXISTS metodo_teste text,
ADD COLUMN IF NOT EXISTS tamanho text,
ADD COLUMN IF NOT EXISTS tipo_valvula text, -- convencional/balanceada
ADD COLUMN IF NOT EXISTS capacidade numeric,
ADD COLUMN IF NOT EXISTS cdtp numeric,
ADD COLUMN IF NOT EXISTS contra_pressao numeric,
ADD COLUMN IF NOT EXISTS temp_operacao_min numeric,
ADD COLUMN IF NOT EXISTS temp_operacao_max numeric,
ADD COLUMN IF NOT EXISTS identificacao_reparo_anterior text,
ADD COLUMN IF NOT EXISTS equipamento_protegido text,
ADD COLUMN IF NOT EXISTS local_instalacao_psv text,
ADD COLUMN IF NOT EXISTS diam_entrada numeric,
ADD COLUMN IF NOT EXISTS diam_saida numeric,
ADD COLUMN IF NOT EXISTS pressao_abertura_recebimento numeric,
ADD COLUMN IF NOT EXISTS desmontada_ultima_inspecao boolean,
ADD COLUMN IF NOT EXISTS meio_teste text,
ADD COLUMN IF NOT EXISTS bancada_teste text,
ADD COLUMN IF NOT EXISTS altura_parafuso_regulagem numeric,
ADD COLUMN IF NOT EXISTS posicao_anel_inferior text,
ADD COLUMN IF NOT EXISTS posicao_anel_superior text,
ADD COLUMN IF NOT EXISTS manometro text;

-- Criar tabela para inspeções
CREATE TABLE IF NOT EXISTS public.inspecoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valvula_id uuid REFERENCES public.valvulas(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tecnico_id uuid REFERENCES public.profiles(id),
  tipo_inspecao text NOT NULL, -- recebimento, periodica, extraordinaria, visual_externa
  data_inicio timestamp with time zone DEFAULT now(),
  data_conclusao timestamp with time zone,
  termino_em timestamp with time zone,
  observacoes text,
  instrumentos_utilizados text,
  pressao_abertura_frio_cdtp numeric,
  fluido_teste text,
  codigo_lacre text,
  teste_integridade_juntas boolean,
  teste_estanqueidade boolean,
  selo_vr boolean DEFAULT false,
  resultado_aprovado boolean,
  resultado_reprovado boolean,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para componentes da inspeção
CREATE TABLE IF NOT EXISTS public.inspecao_componentes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspecao_id uuid REFERENCES public.inspecoes(id) ON DELETE CASCADE,
  componente text NOT NULL, -- corpo, aro, castelo, bocal, fole, etc.
  condicao text, -- bom, regular, ruim, na
  codigo_condicao text, -- A-corrido, B-faltando, C-danificado, etc.
  observacao text,
  novo_codigo_material text,
  nova_corrida text,
  age text,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para fotos das inspeções
CREATE TABLE IF NOT EXISTS public.inspecao_fotos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspecao_id uuid REFERENCES public.inspecoes(id) ON DELETE CASCADE,
  etapa text NOT NULL, -- chegada, desmontada, disco, bocal, castelo, finalizada, lacre
  nome_arquivo text NOT NULL,
  url_foto text NOT NULL,
  descricao text,
  ordem integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para ações requeridas
CREATE TABLE IF NOT EXISTS public.acoes_requeridas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspecao_id uuid REFERENCES public.inspecoes(id) ON DELETE CASCADE,
  acao text NOT NULL, -- limpeza, lapidacao, jato_pintura, manter, retirada, desmontagem_inspecao, limpeza_lapidacao, reparo, calibracao, montagem
  executada boolean DEFAULT false,
  observacao text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.inspecoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecao_componentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecao_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_requeridas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para inspeções
CREATE POLICY "Tecnicos e escritorio podem gerenciar inspecoes"
ON public.inspecoes
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role]));

CREATE POLICY "Usuarios podem ver inspecoes de suas valvulas"
ON public.inspecoes
FOR SELECT
USING (
  get_current_user_role() = 'admin'::user_role OR
  EXISTS (
    SELECT 1 FROM valvulas v 
    WHERE v.id = inspecoes.valvula_id 
    AND v.empresa_id = get_current_user_empresa()
  )
);

-- Políticas RLS para componentes
CREATE POLICY "Tecnicos e escritorio podem gerenciar componentes"
ON public.inspecao_componentes
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role]));

CREATE POLICY "Usuarios podem ver componentes de suas inspecoes"
ON public.inspecao_componentes
FOR SELECT
USING (
  get_current_user_role() = 'admin'::user_role OR
  EXISTS (
    SELECT 1 FROM inspecoes i 
    JOIN valvulas v ON v.id = i.valvula_id
    WHERE i.id = inspecao_componentes.inspecao_id 
    AND v.empresa_id = get_current_user_empresa()
  )
);

-- Políticas RLS para fotos
CREATE POLICY "Tecnicos e escritorio podem gerenciar fotos"
ON public.inspecao_fotos
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role]));

CREATE POLICY "Usuarios podem ver fotos de suas inspecoes"
ON public.inspecao_fotos
FOR SELECT
USING (
  get_current_user_role() = 'admin'::user_role OR
  EXISTS (
    SELECT 1 FROM inspecoes i 
    JOIN valvulas v ON v.id = i.valvula_id
    WHERE i.id = inspecao_fotos.inspecao_id 
    AND v.empresa_id = get_current_user_empresa()
  )
);

-- Políticas RLS para ações
CREATE POLICY "Tecnicos e escritorio podem gerenciar acoes"
ON public.acoes_requeridas
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role]));

CREATE POLICY "Usuarios podem ver acoes de suas inspecoes"
ON public.acoes_requeridas
FOR SELECT
USING (
  get_current_user_role() = 'admin'::user_role OR
  EXISTS (
    SELECT 1 FROM inspecoes i 
    JOIN valvulas v ON v.id = i.valvula_id
    WHERE i.id = acoes_requeridas.inspecao_id 
    AND v.empresa_id = get_current_user_empresa()
  )
);

-- Criar triggers para updated_at
CREATE TRIGGER update_inspecoes_updated_at
  BEFORE UPDATE ON public.inspecoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar buckets de storage para fotos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspecao-fotos', 'inspecao-fotos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para fotos de inspeção
CREATE POLICY "Tecnicos podem upload fotos inspecao"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'inspecao-fotos' AND
  get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role])
);

CREATE POLICY "Usuarios podem ver fotos de suas empresas"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'inspecao-fotos' AND (
    get_current_user_role() = 'admin'::user_role OR
    -- Verificar se a foto pertence a uma inspeção da empresa do usuário
    EXISTS (
      SELECT 1 FROM inspecoes i
      JOIN valvulas v ON v.id = i.valvula_id
      WHERE storage.foldername(name)[1] = i.id::text
      AND v.empresa_id = get_current_user_empresa()
    )
  )
);

CREATE POLICY "Tecnicos podem atualizar fotos inspecao"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'inspecao-fotos' AND
  get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role])
);

CREATE POLICY "Tecnicos podem deletar fotos inspecao"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'inspecao-fotos' AND
  get_current_user_role() = ANY(ARRAY['admin'::user_role, 'tecnico'::user_role, 'escritorio'::user_role])
);
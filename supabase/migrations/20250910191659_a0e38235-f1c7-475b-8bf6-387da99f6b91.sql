-- Criar tipos para roles e status
CREATE TYPE public.user_role AS ENUM ('admin', 'tecnico', 'escritorio', 'cliente');
CREATE TYPE public.valve_status AS ENUM ('ativa', 'inativa', 'manutencao');
CREATE TYPE public.service_status AS ENUM ('pendente', 'em_andamento', 'aguardando_aprovacao', 'aprovado', 'rejeitado');

-- Tabela de empresas/clientes
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de plantas das empresas
CREATE TABLE public.plantas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  role user_role NOT NULL DEFAULT 'cliente',
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de válvulas
CREATE TABLE public.valvulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL, -- Identificação única da válvula
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  planta_id UUID REFERENCES public.plantas(id) ON DELETE SET NULL,
  modelo TEXT,
  fabricante TEXT DEFAULT 'LESER',
  numero_serie TEXT,
  diametro TEXT,
  pressao_abertura DECIMAL,
  pressao_fechamento DECIMAL,
  fluido TEXT,
  temperatura_operacao DECIMAL,
  material_corpo TEXT,
  material_internos TEXT,
  localizacao TEXT,
  status valve_status DEFAULT 'ativa',
  periodicidade_meses INTEGER DEFAULT 12,
  proxima_inspecao DATE,
  observacoes TEXT,
  qr_code TEXT UNIQUE, -- Código único para QR code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de ordens de serviço
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT UNIQUE NOT NULL,
  valvula_id UUID REFERENCES public.valvulas(id) ON DELETE CASCADE,
  tecnico_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  aprovador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tipo_servico TEXT NOT NULL, -- 'inspecao', 'manutencao', 'reparo', 'calibracao'
  data_inicio DATE,
  data_conclusao DATE,
  status service_status DEFAULT 'pendente',
  observacoes_tecnico TEXT,
  observacoes_escritorio TEXT,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  certificado_gerado BOOLEAN DEFAULT false,
  numero_certificado TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'DOWNLOAD', etc.
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valvulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Função para obter o role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Função para obter a empresa do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_empresa()
RETURNS UUID AS $$
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para empresas
CREATE POLICY "Users can view their own empresa" ON public.empresas
  FOR SELECT USING (
    public.get_current_user_role() = 'admin' OR 
    id = public.get_current_user_empresa()
  );

CREATE POLICY "Admins can manage empresas" ON public.empresas
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para plantas
CREATE POLICY "Users can view plantas of their empresa" ON public.plantas
  FOR SELECT USING (
    public.get_current_user_role() = 'admin' OR 
    empresa_id = public.get_current_user_empresa()
  );

CREATE POLICY "Admins and escritorio can manage plantas" ON public.plantas
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'escritorio')
  );

-- Políticas RLS para válvulas
CREATE POLICY "Users can view valvulas of their empresa" ON public.valvulas
  FOR SELECT USING (
    public.get_current_user_role() = 'admin' OR 
    empresa_id = public.get_current_user_empresa()
  );

CREATE POLICY "Admins and escritorio can manage valvulas" ON public.valvulas
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'escritorio')
  );

-- Políticas RLS para ordens de serviço
CREATE POLICY "Users can view OS of their empresa valvulas" ON public.ordens_servico
  FOR SELECT USING (
    public.get_current_user_role() = 'admin' OR 
    EXISTS (
      SELECT 1 FROM public.valvulas v 
      WHERE v.id = valvula_id 
      AND v.empresa_id = public.get_current_user_empresa()
    )
  );

CREATE POLICY "Tecnicos and escritorio can manage OS" ON public.ordens_servico
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'tecnico', 'escritorio')
  );

-- Políticas RLS para audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Trigger para criar profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'name', 'Usuário'),
    new.email,
    'cliente'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plantas_updated_at
  BEFORE UPDATE ON public.plantas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_valvulas_updated_at
  BEFORE UPDATE ON public.valvulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar QR code único
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR' || LPAD(EXTRACT(epoch FROM now())::TEXT, 10, '0') || LPAD(floor(random() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar QR code automaticamente nas válvulas
CREATE OR REPLACE FUNCTION public.handle_new_valvula()
RETURNS trigger AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = public.generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_valvula_qr_code
  BEFORE INSERT ON public.valvulas
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_valvula();
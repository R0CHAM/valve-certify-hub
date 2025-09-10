-- Corrigir search_path nas funções para resolver warning de segurança
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_empresa()
RETURNS UUID AS $$
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR' || LPAD(EXTRACT(epoch FROM now())::TEXT, 10, '0') || LPAD(floor(random() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;
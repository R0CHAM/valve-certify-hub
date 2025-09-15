import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ValveFormProps {
  valve?: any;
  onClose: () => void;
  onSave: () => void;
}

export function ValveForm({ valve, onClose, onSave }: ValveFormProps) {
  const [formData, setFormData] = useState({
    tag: "",
    fabricante: "LESER",
    modelo: "",
    numero_serie: "",
    diametro: "",
    pressao_abertura: "",
    temperatura_operacao: "",
    fluido: "",
    material_corpo: "",
    material_internos: "",
    localizacao: "",
    observacoes: "",
    capacidade: "",
    cdtp: "",
    contra_pressao: "",
    selo_asme: false,
    status: "ativa"
  });

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [plantas, setPlantas] = useState<any[]>([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchEmpresas();
    fetchPlantas();
    if (valve) {
      setFormData({
        tag: valve.tag || "",
        fabricante: valve.fabricante || "LESER",
        modelo: valve.modelo || "",
        numero_serie: valve.numero_serie || "",
        diametro: valve.diametro || "",
        pressao_abertura: valve.pressao_abertura?.toString() || "",
        temperatura_operacao: valve.temperatura_operacao?.toString() || "",
        fluido: valve.fluido || "",
        material_corpo: valve.material_corpo || "",
        material_internos: valve.material_internos || "",
        localizacao: valve.localizacao || "",
        observacoes: valve.observacoes || "",
        capacidade: valve.capacidade?.toString() || "",
        cdtp: valve.cdtp?.toString() || "",
        contra_pressao: valve.contra_pressao?.toString() || "",
        selo_asme: valve.selo_asme || false,
        status: valve.status || "ativa"
      });
    }
  }, [valve]);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase.from('empresas').select('*');
      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const fetchPlantas = async () => {
    try {
      const { data, error } = await supabase.from('plantas').select('*');
      if (error) throw error;
      setPlantas(data || []);
    } catch (error) {
      console.error('Erro ao carregar plantas:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.tag.trim()) {
      toast.error("TAG é obrigatória");
      return;
    }

    try {
      const valveData = {
        ...formData,
        pressao_abertura: parseFloat(formData.pressao_abertura) || null,
        temperatura_operacao: parseFloat(formData.temperatura_operacao) || null,
        capacidade: parseFloat(formData.capacidade) || null,
        cdtp: parseFloat(formData.cdtp) || null,
        contra_pressao: parseFloat(formData.contra_pressao) || null,
        empresa_id: profile?.empresa_id,
        status: formData.status as "ativa" | "inativa" | "manutencao"
      };

      let error;
      if (valve) {
        // Atualizar válvula existente
        const result = await supabase
          .from('valvulas')
          .update(valveData)
          .eq('id', valve.id);
        error = result.error;
      } else {
        // Criar nova válvula
        const result = await supabase
          .from('valvulas')
          .insert(valveData);
        error = result.error;
      }

      if (error) throw error;

      toast.success(valve ? "Válvula atualizada com sucesso!" : "Válvula criada com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar válvula:', error);
      toast.error('Erro ao salvar válvula');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{valve ? 'Editar Válvula' : 'Nova Válvula'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>TAG *</Label>
                <Input 
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  placeholder="Ex: PSV-001"
                />
              </div>
              <div>
                <Label>Fabricante</Label>
                <Select value={formData.fabricante} onValueChange={(value) => 
                  setFormData({...formData, fabricante: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LESER">LESER</SelectItem>
                    <SelectItem value="DRESSER">DRESSER</SelectItem>
                    <SelectItem value="ANDERSON GREENWOOD">ANDERSON GREENWOOD</SelectItem>
                    <SelectItem value="CROSBY">CROSBY</SelectItem>
                    <SelectItem value="ALTRO">OUTRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modelo</Label>
                <Input 
                  value={formData.modelo}
                  onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                />
              </div>
              <div>
                <Label>Número de Série</Label>
                <Input 
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                />
              </div>
              <div>
                <Label>Diâmetro</Label>
                <Input 
                  value={formData.diametro}
                  onChange={(e) => setFormData({...formData, diametro: e.target.value})}
                  placeholder="Ex: 1 x 2"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => 
                  setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especificações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pressão de Abertura (bar-g)</Label>
                <Input 
                  type="number"
                  value={formData.pressao_abertura}
                  onChange={(e) => setFormData({...formData, pressao_abertura: e.target.value})}
                />
              </div>
              <div>
                <Label>Temperatura de Operação (°C)</Label>
                <Input 
                  type="number"
                  value={formData.temperatura_operacao}
                  onChange={(e) => setFormData({...formData, temperatura_operacao: e.target.value})}
                />
              </div>
              <div>
                <Label>Capacidade</Label>
                <Input 
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                />
              </div>
              <div>
                <Label>CDTP (bar-g)</Label>
                <Input 
                  type="number"
                  value={formData.cdtp}
                  onChange={(e) => setFormData({...formData, cdtp: e.target.value})}
                />
              </div>
              <div>
                <Label>Contra Pressão (bar-g)</Label>
                <Input 
                  type="number"
                  value={formData.contra_pressao}
                  onChange={(e) => setFormData({...formData, contra_pressao: e.target.value})}
                />
              </div>
              <div>
                <Label>Fluido</Label>
                <Input 
                  value={formData.fluido}
                  onChange={(e) => setFormData({...formData, fluido: e.target.value})}
                />
              </div>
              <div>
                <Label>Material do Corpo</Label>
                <Input 
                  value={formData.material_corpo}
                  onChange={(e) => setFormData({...formData, material_corpo: e.target.value})}
                />
              </div>
              <div>
                <Label>Material dos Internos</Label>
                <Input 
                  value={formData.material_internos}
                  onChange={(e) => setFormData({...formData, material_internos: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Localização</Label>
                <Input 
                  value={formData.localizacao}
                  onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selo_asme"
                    checked={formData.selo_asme}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, selo_asme: !!checked})}
                  />
                  <Label htmlFor="selo_asme">Selo ASME</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
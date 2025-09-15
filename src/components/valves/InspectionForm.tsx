import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PhotoUpload } from "./PhotoUpload";

interface InspectionFormProps {
  valve: any;
  onClose: () => void;
}

const INSPECTION_STEPS = [
  { id: "chegada", name: "Chegada", description: "Válvula na chegada" },
  { id: "desmontada", name: "Desmontada", description: "Válvula desmontada" },
  { id: "disco", name: "Disco", description: "Inspeção do disco" },
  { id: "bocal", name: "Bocal", description: "Inspeção do bocal" },
  { id: "castelo", name: "Castelo", description: "Inspeção do castelo" },
  { id: "finalizada", name: "Finalizada", description: "Válvula montada e finalizada" },
  { id: "lacre", name: "Lacre", description: "Aplicação do lacre" }
];

const COMPONENTS = [
  "Corpo", "Aro", "Castelo", "Bocal", "Fole", "Disco", "Sede", 
  "Parafusos", "Mola", "Guia", "Porca de regulagem", "Outro"
];

const CONDITIONS = [
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
  { value: "na", label: "N/A" }
];

const ACTIONS = [
  "Limpeza", "Lapidação", "Jato/Pintura", "Manter", "Retirada", 
  "Desmontagem/Inspeção", "Limpeza/Lapidação", "Reparo", "Calibração", "Montagem"
];

export function InspectionForm({ valve, onClose }: InspectionFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo_inspecao: "periodica",
    observacoes: "",
    instrumentos_utilizados: "",
    pressao_abertura_frio_cdtp: "",
    fluido_teste: "liquido",
    codigo_lacre: "",
    teste_integridade_juntas: false,
    teste_estanqueidade: false,
    selo_vr: false,
    bpm_estanqueidade: ""
  });
  const [components, setComponents] = useState<any[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const { user } = useAuth();

  const createInspection = async () => {
    if (!valve || !user) return;

    try {
      const { data, error } = await supabase
        .from('inspecoes')
        .insert({
          valvula_id: valve.id,
          tecnico_id: user.id,
          tipo_inspecao: formData.tipo_inspecao,
          observacoes: formData.observacoes,
          instrumentos_utilizados: formData.instrumentos_utilizados,
          pressao_abertura_frio_cdtp: parseFloat(formData.pressao_abertura_frio_cdtp) || null,
          fluido_teste: formData.fluido_teste,
          codigo_lacre: formData.codigo_lacre,
          teste_integridade_juntas: formData.teste_integridade_juntas,
          teste_estanqueidade: formData.teste_estanqueidade,
          selo_vr: formData.selo_vr
        })
        .select()
        .single();

      if (error) throw error;
      setInspectionId(data.id);
      toast.success("Inspeção criada com sucesso!");
      return data.id;
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      toast.error('Erro ao criar inspeção');
      return null;
    }
  };

  const saveComponents = async () => {
    if (!inspectionId) return;

    try {
      const componentsToSave = components.map(comp => ({
        inspecao_id: inspectionId,
        ...comp
      }));

      const { error } = await supabase
        .from('inspecao_componentes')
        .insert(componentsToSave);

      if (error) throw error;
      toast.success("Componentes salvos!");
    } catch (error) {
      console.error('Erro ao salvar componentes:', error);
      toast.error('Erro ao salvar componentes');
    }
  };

  const saveActions = async () => {
    if (!inspectionId) return;

    try {
      const actionsToSave = actions.map(action => ({
        inspecao_id: inspectionId,
        acao: action
      }));

      const { error } = await supabase
        .from('acoes_requeridas')
        .insert(actionsToSave);

      if (error) throw error;
      toast.success("Ações salvas!");
    } catch (error) {
      console.error('Erro ao salvar ações:', error);
      toast.error('Erro ao salvar ações');
    }
  };

  const finishInspection = async () => {
    if (!inspectionId) return;

    try {
      await saveComponents();
      await saveActions();

      const { error } = await supabase
        .from('inspecoes')
        .update({
          data_conclusao: new Date().toISOString(),
          resultado_aprovado: true
        })
        .eq('id', inspectionId);

      if (error) throw error;
      toast.success("Inspeção finalizada com sucesso!");
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar inspeção:', error);
      toast.error('Erro ao finalizar inspeção');
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const newInspectionId = await createInspection();
      if (!newInspectionId) return;
    }
    
    if (currentStep < INSPECTION_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await finishInspection();
    }
  };

  const addComponent = () => {
    setComponents([...components, {
      componente: "",
      condicao: "",
      codigo_condicao: "",
      observacao: "",
      novo_codigo_material: "",
      nova_corrida: "",
      age: ""
    }]);
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const toggleAction = (action: string) => {
    setActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Inspeção - {valve?.tag}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {INSPECTION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                {index < INSPECTION_STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Inspeção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Inspeção</Label>
                    <Select value={formData.tipo_inspecao} onValueChange={(value) => 
                      setFormData({...formData, tipo_inspecao: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recebimento">Recebimento</SelectItem>
                        <SelectItem value="periodica">Periódica</SelectItem>
                        <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                        <SelectItem value="visual_externa">Visual Externa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Instrumentos Utilizados</Label>
                    <Input 
                      value={formData.instrumentos_utilizados}
                      onChange={(e) => setFormData({...formData, instrumentos_utilizados: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Pressão Abertura Frio CDTP (bar-g)</Label>
                    <Input 
                      type="number"
                      value={formData.pressao_abertura_frio_cdtp}
                      onChange={(e) => setFormData({...formData, pressao_abertura_frio_cdtp: e.target.value})}
                      placeholder="Ex: 2.5"
                    />
                  </div>
                  <div>
                    <Label>Fluido de Teste</Label>
                    <Select 
                      value={formData.fluido_teste} 
                      onValueChange={(value) => setFormData({...formData, fluido_teste: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquido">Líquido</SelectItem>
                        <SelectItem value="gasoso">Gasoso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="teste_integridade"
                      checked={formData.teste_integridade_juntas}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, teste_integridade_juntas: !!checked})}
                    />
                    <Label htmlFor="teste_integridade">Teste Integridade Juntas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="teste_estanqueidade"
                      checked={formData.teste_estanqueidade}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, teste_estanqueidade: !!checked})}
                    />
                    <Label htmlFor="teste_estanqueidade">Teste Estanqueidade</Label>
                  </div>
                  {formData.teste_estanqueidade && (
                    <div className="ml-6">
                      <Label>BPM (Bolhas por Minuto)</Label>
                      <Input 
                        type="number"
                        value={formData.bpm_estanqueidade}
                        onChange={(e) => setFormData({...formData, bpm_estanqueidade: e.target.value})}
                        placeholder="Ex: 5"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="selo_vr"
                      checked={formData.selo_vr}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, selo_vr: !!checked})}
                    />
                    <Label htmlFor="selo_vr">Selo VR</Label>
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep > 0 && currentStep <= INSPECTION_STEPS.length && inspectionId && (
            <PhotoUpload 
              inspectionId={inspectionId}
              step={INSPECTION_STEPS[currentStep - 1]}
            />
          )}

          {currentStep === INSPECTION_STEPS.length + 1 && (
            <Tabs defaultValue="components">
              <TabsList>
                <TabsTrigger value="components">Componentes</TabsTrigger>
                <TabsTrigger value="actions">Ações Requeridas</TabsTrigger>
              </TabsList>

              <TabsContent value="components" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Inspeção de Componentes</h3>
                  <Button onClick={addComponent}>
                    <Camera className="h-4 w-4 mr-2" />
                    Adicionar Componente
                  </Button>
                </div>

                {components.map((component, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Componente {index + 1}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeComponent(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Componente</Label>
                          <Select 
                            value={component.componente}
                            onValueChange={(value) => updateComponent(index, 'componente', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPONENTS.map(comp => (
                                <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Condição</Label>
                          <Select 
                            value={component.condicao}
                            onValueChange={(value) => updateComponent(index, 'condicao', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITIONS.map(cond => (
                                <SelectItem key={cond.value} value={cond.value}>
                                  {cond.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Código Condição</Label>
                          <Input 
                            value={component.codigo_condicao}
                            onChange={(e) => updateComponent(index, 'codigo_condicao', e.target.value)}
                            placeholder="Ex: A-corrido"
                          />
                        </div>
                        <div>
                          <Label>AGE</Label>
                          <Input 
                            value={component.age}
                            onChange={(e) => updateComponent(index, 'age', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Observação</Label>
                        <Textarea 
                          value={component.observacao}
                          onChange={(e) => updateComponent(index, 'observacao', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <h3 className="text-lg font-semibold">Ações Requeridas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ACTIONS.map(action => (
                    <div key={action} className="flex items-center space-x-2">
                      <Checkbox 
                        id={action}
                        checked={actions.includes(action)}
                        onCheckedChange={() => toggleAction(action)}
                      />
                      <Label htmlFor={action}>{action}</Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleNext}>
              {currentStep === INSPECTION_STEPS.length + 1 ? 'Finalizar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
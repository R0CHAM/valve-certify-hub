import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Upload, Search, Plus, Edit, Trash2, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type ValvulaRow = Database['public']['Tables']['valvulas']['Row'];
type ValvulaInsert = Database['public']['Tables']['valvulas']['Insert'];
type ValvulaUpdate = Database['public']['Tables']['valvulas']['Update'];

interface Empresa {
  id: string;
  nome: string;
}

interface Planta {
  id: string;
  nome: string;
  endereco: string;
}

const ETAPAS_FOTOS = [
  { id: 'chegada', nome: 'Válvula na Chegada', descricao: 'Foto da válvula ao chegar para inspeção' },
  { id: 'desmontada', nome: 'Válvula Desmontada', descricao: 'Componentes após desmontagem' },
  { id: 'disco', nome: 'Disco', descricao: 'Detalhe do disco da válvula' },
  { id: 'bocal', nome: 'Bocal', descricao: 'Detalhe do bocal' },
  { id: 'castelo', nome: 'Castelo', descricao: 'Detalhe do castelo' },
  { id: 'sede', nome: 'Sede', descricao: 'Detalhe da sede' },
  { id: 'mola', nome: 'Mola', descricao: 'Sistema de mola' },
  { id: 'finalizada', nome: 'Válvula Finalizada', descricao: 'Válvula após reparo/inspeção' },
  { id: 'lacre', nome: 'Lacre', descricao: 'Lacre de segurança aplicado' },
];

export default function ValvulasManagement() {
  const { user, profile } = useAuth();
  const [valvulas, setValvulas] = useState<ValvulaRow[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValvula, setSelectedValvula] = useState<ValvulaRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ValvulaInsert & ValvulaUpdate>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar válvulas
      const { data: valvulasData, error: valvulasError } = await supabase
        .from('valvulas')
        .select('*')
        .order('tag');

      if (valvulasError) throw valvulasError;
      setValvulas(valvulasData || []);

      // Buscar empresas (apenas para admin/escritorio)
      if (profile?.role === 'admin' || profile?.role === 'escritorio') {
        const { data: empresasData, error: empresasError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (empresasError) throw empresasError;
        setEmpresas(empresasData || []);

        const { data: plantasData, error: plantasError } = await supabase
          .from('plantas')
          .select('*')
          .order('nome');

        if (plantasError) throw plantasError;
        setPlantas(plantasData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveValvula = async () => {
    try {
      if (!formData.tag) {
        toast.error('TAG é obrigatória');
        return;
      }

      const valvulaData: ValvulaInsert = {
        ...formData,
        fabricante: formData.fabricante || 'LESER',
        tag: formData.tag!,
      };

      if (selectedValvula) {
        // Atualizar
        const updateData: ValvulaUpdate = { ...formData };
        const { error } = await supabase
          .from('valvulas')
          .update(updateData)
          .eq('id', selectedValvula.id);

        if (error) throw error;
        toast.success('Válvula atualizada com sucesso');
      } else {
        // Criar nova
        const { error } = await supabase
          .from('valvulas')
          .insert(valvulaData);

        if (error) throw error;
        toast.success('Válvula criada com sucesso');
      }

      setIsEditing(false);
      setSelectedValvula(null);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar válvula:', error);
      toast.error('Erro ao salvar válvula');
    }
  };

  const handlePhotoUpload = async (etapa: string, file: File) => {
    if (!selectedValvula) return;

    try {
      setUploadingPhotos(prev => ({ ...prev, [etapa]: true }));

      // Upload da foto para o storage
      const fileName = `${selectedValvula.id}/${etapa}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('inspecao-fotos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Salvar referência no banco
      const { error: dbError } = await supabase
        .from('inspecao_fotos')
        .insert([{
          inspecao_id: selectedValvula.id, // Temporário - idealmente seria uma inspeção específica
          etapa,
          nome_arquivo: file.name,
          url_foto: fileName,
          descricao: `Foto da etapa: ${etapa}`
        }]);

      if (dbError) throw dbError;

      toast.success(`Foto da etapa "${etapa}" enviada com sucesso`);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [etapa]: false }));
    }
  };

  const filteredValvulas = valvulas.filter(valvula =>
    valvula.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valvula.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valvula.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Válvulas</h1>
        {(profile?.role === 'admin' || profile?.role === 'escritorio') && (
          <Button
            onClick={() => {
              setSelectedValvula(null);
              setFormData({});
              setIsEditing(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Válvula
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por TAG, fabricante ou modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Válvulas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TAG</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Nº Série</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Próxima Inspeção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredValvulas.map((valvula) => (
                <TableRow key={valvula.id}>
                  <TableCell className="font-medium">{valvula.tag}</TableCell>
                  <TableCell>{valvula.fabricante}</TableCell>
                  <TableCell>{valvula.modelo}</TableCell>
                  <TableCell>{valvula.numero_serie}</TableCell>
                  <TableCell>
                    <Badge variant={valvula.status === 'ativa' ? 'default' : 'secondary'}>
                      {valvula.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{valvula.localizacao}</TableCell>
                  <TableCell>{valvula.proxima_inspecao ? new Date(valvula.proxima_inspecao).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedValvula(valvula);
                          setFormData(valvula);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      {(profile?.role === 'admin' || profile?.role === 'escritorio' || profile?.role === 'tecnico') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedValvula(valvula);
                            setFormData(valvula);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes/Edição */}
      <Dialog open={selectedValvula !== null} onOpenChange={() => {
        setSelectedValvula(null);
        setIsEditing(false);
        setFormData({});
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Válvula' : 'Detalhes da Válvula'}
              {selectedValvula && ` - ${selectedValvula.tag}`}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dados" className="w-full">
            <TabsList>
              <TabsTrigger value="dados">Dados Técnicos</TabsTrigger>
              <TabsTrigger value="inspecao">Dados de Inspeção</TabsTrigger>
              <TabsTrigger value="fotos">Fotos por Etapa</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tag">TAG *</Label>
                  <Input
                    id="tag"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={formData.fabricante || 'LESER'}
                    onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo || ''}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="numero_serie">Número de Série</Label>
                  <Input
                    id="numero_serie"
                    value={formData.numero_serie || ''}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_valvula">Tipo de Válvula</Label>
                  <Select
                    value={formData.tipo_valvula || ''}
                    onValueChange={(value) => setFormData({ ...formData, tipo_valvula: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="convencional">Convencional</SelectItem>
                      <SelectItem value="balanceada">Balanceada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tamanho">Tamanho</Label>
                  <Input
                    id="tamanho"
                    value={formData.tamanho || ''}
                    onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="diametro">Diâmetro</Label>
                  <Input
                    id="diametro"
                    value={formData.diametro || ''}
                    onChange={(e) => setFormData({ ...formData, diametro: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="fluido">Fluido</Label>
                  <Input
                    id="fluido"
                    value={formData.fluido || ''}
                    onChange={(e) => setFormData({ ...formData, fluido: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="material_corpo">Material do Corpo</Label>
                  <Input
                    id="material_corpo"
                    value={formData.material_corpo || ''}
                    onChange={(e) => setFormData({ ...formData, material_corpo: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="material_internos">Material dos Internos</Label>
                  <Input
                    id="material_internos"
                    value={formData.material_internos || ''}
                    onChange={(e) => setFormData({ ...formData, material_internos: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="pressao_abertura">Pressão de Abertura (bar)</Label>
                  <Input
                    id="pressao_abertura"
                    type="number"
                    step="0.01"
                    value={formData.pressao_abertura || ''}
                    onChange={(e) => setFormData({ ...formData, pressao_abertura: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="cdtp">CDTP</Label>
                  <Input
                    id="cdtp"
                    type="number"
                    step="0.01"
                    value={formData.cdtp || ''}
                    onChange={(e) => setFormData({ ...formData, cdtp: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    step="0.01"
                    value={formData.capacidade || ''}
                    onChange={(e) => setFormData({ ...formData, capacidade: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="temperatura_operacao">Temperatura de Operação (°C)</Label>
                  <Input
                    id="temperatura_operacao"
                    type="number"
                    step="0.1"
                    value={formData.temperatura_operacao || ''}
                    onChange={(e) => setFormData({ ...formData, temperatura_operacao: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="contra_pressao">Contra Pressão</Label>
                  <Input
                    id="contra_pressao"
                    type="number"
                    step="0.01"
                    value={formData.contra_pressao || ''}
                    onChange={(e) => setFormData({ ...formData, contra_pressao: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao || ''}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="selo_asme"
                    checked={formData.selo_asme || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, selo_asme: checked })}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="selo_asme">Selo ASME</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveValvula}>Salvar</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="inspecao" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metodo_teste">Método de Teste</Label>
                  <Input
                    id="metodo_teste"
                    value={formData.metodo_teste || ''}
                    onChange={(e) => setFormData({ ...formData, metodo_teste: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="meio_teste">Meio de Teste</Label>
                  <Input
                    id="meio_teste"
                    value={formData.meio_teste || ''}
                    onChange={(e) => setFormData({ ...formData, meio_teste: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="bancada_teste">Bancada de Teste</Label>
                  <Input
                    id="bancada_teste"
                    value={formData.bancada_teste || ''}
                    onChange={(e) => setFormData({ ...formData, bancada_teste: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="altura_parafuso_regulagem">Altura Parafuso Regulagem</Label>
                  <Input
                    id="altura_parafuso_regulagem"
                    type="number"
                    step="0.01"
                    value={formData.altura_parafuso_regulagem || ''}
                    onChange={(e) => setFormData({ ...formData, altura_parafuso_regulagem: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="posicao_anel_inferior">Posição Anel Inferior</Label>
                  <Input
                    id="posicao_anel_inferior"
                    value={formData.posicao_anel_inferior || ''}
                    onChange={(e) => setFormData({ ...formData, posicao_anel_inferior: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="posicao_anel_superior">Posição Anel Superior</Label>
                  <Input
                    id="posicao_anel_superior"
                    value={formData.posicao_anel_superior || ''}
                    onChange={(e) => setFormData({ ...formData, posicao_anel_superior: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="manometro">Manômetro</Label>
                  <Input
                    id="manometro"
                    value={formData.manometro || ''}
                    onChange={(e) => setFormData({ ...formData, manometro: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="desmontada_ultima_inspecao"
                    checked={formData.desmontada_ultima_inspecao || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, desmontada_ultima_inspecao: checked })}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="desmontada_ultima_inspecao">Desmontada na Última Inspeção</Label>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveValvula}>Salvar</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fotos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ETAPAS_FOTOS.map((etapa) => (
                  <Card key={etapa.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{etapa.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground">{etapa.descricao}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor={`foto-${etapa.id}`} className="sr-only">
                          Upload foto {etapa.nome}
                        </Label>
                        <Input
                          id={`foto-${etapa.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handlePhotoUpload(etapa.id, file);
                            }
                          }}
                          disabled={uploadingPhotos[etapa.id]}
                        />
                        {uploadingPhotos[etapa.id] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Eye, Camera, FileText, ArrowLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ValveDetails } from "@/components/valves/ValveDetails";
import { InspectionForm } from "@/components/valves/InspectionForm";
import { ValveForm } from "@/components/valves/ValveForm";
import { PDFGenerator } from "@/components/valves/PDFGenerator";

interface Valvula {
  id: string;
  tag: string;
  fabricante: string;
  modelo: string;
  numero_serie: string;
  status: string;
  proxima_inspecao: string;
  empresa_id: string;
  planta_id: string;
  pressao_abertura: number;
  temperatura_operacao: number;
  diametro: string;
  fluido: string;
  localizacao: string;
  qr_code: string;
}

interface Inspection {
  id: string;
  valvula_id: string;
  tipo_inspecao: string;
  data_inicio: string;
  data_conclusao: string;
  resultado_aprovado: boolean;
  resultado_reprovado: boolean;
  observacoes: string;
}

export default function ValvulasManagement() {
  const [valvulas, setValvulas] = useState<Valvula[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedValve, setSelectedValve] = useState<Valvula | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showAddValve, setShowAddValve] = useState(false);
  const [editingValve, setEditingValve] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchValvulas();
      fetchInspections();
    }
  }, [user]);

  const fetchValvulas = async () => {
    try {
      const { data, error } = await supabase
        .from('valvulas')
        .select('*')
        .order('tag');

      if (error) throw error;
      setValvulas(data || []);
    } catch (error) {
      console.error('Erro ao carregar válvulas:', error);
      toast.error('Erro ao carregar válvulas');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspecoes')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
    }
  };

  const filteredValvulas = valvulas.filter(valvula =>
    valvula.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valvula.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valvula.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'inativa': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const canManageValves = profile?.role === 'admin' || profile?.role === 'escritorio' || profile?.role === 'tecnico';

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestão de Válvulas</h1>
            <p className="text-muted-foreground">Gerenciamento de válvulas e inspeções</p>
          </div>
        </div>
        {canManageValves && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddValve(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Válvula
            </Button>
            <Button onClick={() => setShowInspectionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Inspeção
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="valvulas" className="w-full">
        <TabsList>
          <TabsTrigger value="valvulas">Válvulas</TabsTrigger>
          <TabsTrigger value="inspecoes">Inspeções</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="valvulas" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tag, fabricante ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredValvulas.map((valvula) => (
              <Card key={valvula.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{valvula.tag}</CardTitle>
                    <Badge className={`${getStatusColor(valvula.status)} text-white`}>
                      {valvula.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {valvula.fabricante} - {valvula.modelo}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Série:</strong> {valvula.numero_serie}</div>
                    <div><strong>Localização:</strong> {valvula.localizacao}</div>
                    <div><strong>Próxima Inspeção:</strong> {valvula.proxima_inspecao ? new Date(valvula.proxima_inspecao).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>QR Code:</strong> {valvula.qr_code}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedValve(valvula)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    {canManageValves && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedValve(valvula);
                          setEditingValve(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {canManageValves && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedValve(valvula);
                          setShowInspectionForm(true);
                        }}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Inspeção
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspecoes" className="space-y-4">
          <div className="grid gap-4">
            {inspections.map((inspection) => {
              const valvula = valvulas.find(v => v.id === inspection.valvula_id);
              return (
                <Card key={inspection.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{valvula?.tag || 'Válvula não encontrada'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {inspection.tipo_inspecao} - {new Date(inspection.data_inicio).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        inspection.resultado_aprovado ? 'default' : 
                        inspection.resultado_reprovado ? 'destructive' : 
                        'secondary'
                      }>
                        {inspection.resultado_aprovado ? 'Aprovado' : 
                         inspection.resultado_reprovado ? 'Reprovado' : 
                         'Em andamento'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{inspection.observacoes}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Relatório
                      </Button>
                      <PDFGenerator 
                        inspectionId={inspection.id}
                        valveName={valvula?.tag || 'Válvula'}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de relatórios em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedValve && !showInspectionForm && !editingValve && (
        <ValveDetails 
          valve={selectedValve} 
          onClose={() => setSelectedValve(null)}
        />
      )}

      {showInspectionForm && (
        <InspectionForm 
          valve={selectedValve}
          onClose={() => {
            setShowInspectionForm(false);
            setSelectedValve(null);
            fetchInspections();
          }}
        />
      )}

      {(showAddValve || editingValve) && (
        <ValveForm 
          valve={editingValve ? selectedValve : null}
          onClose={() => {
            setShowAddValve(false);
            setEditingValve(false);
            setSelectedValve(null);
          }}
          onSave={() => {
            fetchValvulas();
            setShowAddValve(false);
            setEditingValve(false);
            setSelectedValve(null);
          }}
        />
      )}
    </div>
  );
}
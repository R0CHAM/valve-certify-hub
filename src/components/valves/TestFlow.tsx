import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Video, CheckCircle, XCircle, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TestFlowProps {
  valve: any;
  inspectionId: string;
  testConfig: {
    test_type: string;
    test_components: string[];
    instrumentos_utilizados: string;
    pressao_abertura_frio_cdtp: string;
    fluido_teste: string;
  };
  onFinish: () => void;
  onBack: () => void;
  onDelete: () => void;
}

interface TestResults {
  pressao_abertura_teste1?: number;
  pressao_abertura_teste2?: number;
  pressao_abertura_teste3?: number;
  estanqueidade_bpm?: number;
  contrapressao_aprovada?: boolean;
  observacao_reprovacao?: string;
}

export function TestFlow({ valve, inspectionId, testConfig, onFinish, onBack, onDelete }: TestFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [uploadedVideos, setUploadedVideos] = useState<{[key: string]: string}>({});

  const cdtpValue = parseFloat(testConfig.pressao_abertura_frio_cdtp) || 0;
  const toleranceMin = cdtpValue * 0.97; // -3%
  const toleranceMax = cdtpValue * 1.03; // +3%

  const isTestApproved = (testValue: number) => {
    return testValue >= toleranceMin && testValue <= toleranceMax;
  };

  const getTestApprovalStatus = () => {
    if (testConfig.test_components.includes('pressao_abertura')) {
      const test3 = testResults.pressao_abertura_teste3;
      if (test3 && !isTestApproved(test3)) return false;
    }
    return true;
  };

  const handleVideoUpload = async (testType: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${inspectionId}/videos/${testType}/${Date.now()}.${fileExt}`;
      
      // Simular upload (aqui você implementaria o upload real)
      toast.success(`Vídeo do ${testType} carregado com sucesso!`);
      setUploadedVideos(prev => ({
        ...prev,
        [testType]: fileName
      }));
    } catch (error) {
      toast.error('Erro ao carregar vídeo');
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 2 && (
                <div className={`h-0.5 w-8 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Etapa {currentStep} de 2
        </div>
      </div>

      {/* Step 1: Test Results */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Configuração do Teste</h4>
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <strong>Tipo:</strong> {testConfig.test_type === 'teste_recebimento' ? 'Teste de Recebimento' : 
                                         testConfig.test_type === 'teste_intermediario' ? 'Teste Intermediário' : 'Teste Final'}
                </div>
                <div>
                  <strong>CDTP:</strong> {testConfig.pressao_abertura_frio_cdtp} bar-g
                </div>
                <div>
                  <strong>Fluido:</strong> {testConfig.fluido_teste === 'liquido' ? 'Líquido' : 'Gasoso'}
                </div>
              </div>
              {testConfig.instrumentos_utilizados && (
                <div className="mt-2 text-sm text-blue-700">
                  <strong>Instrumentos:</strong> {testConfig.instrumentos_utilizados}
                </div>
              )}
            </div>

            {testConfig.test_components.includes('pressao_abertura') && (
              <div className="space-y-4">
                <h4 className="font-medium">Teste de Pressão de Abertura</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-700">
                    <strong>CDTP:</strong> {cdtpValue} bar-g <br />
                    <strong>Tolerância ASME XIII:</strong> {toleranceMin.toFixed(2)} - {toleranceMax.toFixed(2)} bar-g
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Teste 1 (bar-g) *</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={testResults.pressao_abertura_teste1 || ''}
                      onChange={(e) => setTestResults({...testResults, pressao_abertura_teste1: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Teste 2 (bar-g) *</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={testResults.pressao_abertura_teste2 || ''}
                      onChange={(e) => setTestResults({...testResults, pressao_abertura_teste2: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Teste 3 (bar-g) *</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={testResults.pressao_abertura_teste3 || ''}
                      onChange={(e) => setTestResults({...testResults, pressao_abertura_teste3: parseFloat(e.target.value)})}
                      required
                    />
                    {testResults.pressao_abertura_teste3 && (
                      <div className="mt-2">
                        {isTestApproved(testResults.pressao_abertura_teste3) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Aprovado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Reprovado</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {testConfig.test_components.includes('estanqueidade') && (
              <div className="space-y-4">
                <h4 className="font-medium">Teste de Estanqueidade</h4>
                <div>
                  <Label>Bolhas por Minuto (BPM) *</Label>
                  <Input 
                    type="number"
                    value={testResults.estanqueidade_bpm || ''}
                    onChange={(e) => setTestResults({...testResults, estanqueidade_bpm: parseFloat(e.target.value)})}
                    placeholder="Ex: 0"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Registre o número de bolhas observadas por minuto
                  </p>
                </div>
              </div>
            )}

            {testConfig.test_components.includes('contrapressao') && (
              <div className="space-y-4">
                <h4 className="font-medium">Teste de Contrapressão</h4>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="contrapressao_aprovada"
                      checked={testResults.contrapressao_aprovada === true}
                      onCheckedChange={(checked) => 
                        setTestResults({...testResults, contrapressao_aprovada: !!checked})
                      }
                    />
                    <Label htmlFor="contrapressao_aprovada" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Aprovada
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="contrapressao_reprovada"
                      checked={testResults.contrapressao_aprovada === false}
                      onCheckedChange={(checked) => 
                        setTestResults({...testResults, contrapressao_aprovada: checked ? false : undefined})
                      }
                    />
                    <Label htmlFor="contrapressao_reprovada" className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Reprovada
                    </Label>
                  </div>
                </div>
                {testResults.contrapressao_aprovada === false && (
                  <div className="mt-4">
                    <Label>Observação sobre a reprovação *</Label>
                    <Textarea 
                      value={testResults.observacao_reprovacao || ''}
                      onChange={(e) => setTestResults({...testResults, observacao_reprovacao: e.target.value})}
                      placeholder="Descreva o motivo da reprovação..."
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Video Upload */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload de Vídeos dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {testConfig.test_components.map(testType => (
              <div key={testType} className="space-y-4">
                <h4 className="font-medium">
                  Vídeo - {testType === 'pressao_abertura' ? 'Pressão de Abertura' : 
                           testType === 'estanqueidade' ? 'Estanqueidade' : 'Contrapressão'}
                </h4>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload do vídeo do teste
                  </p>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(testType, file);
                    }}
                    className="hidden"
                    id={`video-${testType}`}
                  />
                  <Label htmlFor={`video-${testType}`} className="cursor-pointer">
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Vídeo
                    </Button>
                  </Label>
                  {uploadedVideos[testType] && (
                    <div className="mt-2 text-sm text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Vídeo carregado com sucesso
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Teste
          </Button>
        </div>
        <Button onClick={handleNext}>
          {currentStep === 2 ? 'Finalizar' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}
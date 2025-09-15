import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface ValveDetailsProps {
  valve: any;
  onClose: () => void;
}

export function ValveDetails({ valve, onClose }: ValveDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'inativa': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{valve.tag}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge className={`${getStatusColor(valve.status)} text-white`}>
              {valve.status}
            </Badge>
            {valve.selo_asme && (
              <Badge variant="outline">ASME</Badge>
            )}
            {valve.selo_vr && (
              <Badge variant="outline">VR</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid gap-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fabricante</label>
                <p className="font-medium">{valve.fabricante || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                <p className="font-medium">{valve.modelo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número de Série</label>
                <p className="font-medium">{valve.numero_serie || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diâmetro</label>
                <p className="font-medium">{valve.diametro || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tamanho</label>
                <p className="font-medium">{valve.tamanho || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Válvula</label>
                <p className="font-medium">{valve.tipo_valvula || 'N/A'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pressão de Abertura</label>
                <p className="font-medium">{valve.pressao_abertura ? `${valve.pressao_abertura} bar` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pressão de Fechamento</label>
                <p className="font-medium">{valve.pressao_fechamento ? `${valve.pressao_fechamento} bar` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temperatura Operação</label>
                <p className="font-medium">{valve.temperatura_operacao ? `${valve.temperatura_operacao}°C` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temp. Mín</label>
                <p className="font-medium">{valve.temp_operacao_min ? `${valve.temp_operacao_min}°C` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temp. Máx</label>
                <p className="font-medium">{valve.temp_operacao_max ? `${valve.temp_operacao_max}°C` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Capacidade</label>
                <p className="font-medium">{valve.capacidade || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CDTP</label>
                <p className="font-medium">{valve.cdtp || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contra-pressão</label>
                <p className="font-medium">{valve.contra_pressao ? `${valve.contra_pressao} bar` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Símbolo NB</label>
                <p className="font-medium">{valve.simbolo_nb || 'N/A'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Materiais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material do Corpo</label>
                <p className="font-medium">{valve.material_corpo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material dos Internos</label>
                <p className="font-medium">{valve.material_internos || 'N/A'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Localização e Instalação</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Localização</label>
                <p className="font-medium">{valve.localizacao || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Equipamento Protegido</label>
                <p className="font-medium">{valve.equipamento_protegido || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Local Instalação PSV</label>
                <p className="font-medium">{valve.local_instalacao_psv || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diâm. Entrada</label>
                <p className="font-medium">{valve.diam_entrada ? `${valve.diam_entrada} mm` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diâm. Saída</label>
                <p className="font-medium">{valve.diam_saida ? `${valve.diam_saida} mm` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fluido</label>
                <p className="font-medium">{valve.fluido || 'N/A'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Inspeção e Teste</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Método de Teste</label>
                <p className="font-medium">{valve.metodo_teste || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Meio de Teste</label>
                <p className="font-medium">{valve.meio_teste || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bancada de Teste</label>
                <p className="font-medium">{valve.bancada_teste || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pressão Recebimento</label>
                <p className="font-medium">{valve.pressao_abertura_recebimento ? `${valve.pressao_abertura_recebimento} bar` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Próxima Inspeção</label>
                <p className="font-medium">{valve.proxima_inspecao ? new Date(valve.proxima_inspecao).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">QR Code</label>
                <p className="font-medium">{valve.qr_code || 'N/A'}</p>
              </div>
            </div>
          </section>

          {valve.observacoes && (
            <>
              <Separator />
              <section>
                <h3 className="text-lg font-semibold mb-3">Observações</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{valve.observacoes}</p>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
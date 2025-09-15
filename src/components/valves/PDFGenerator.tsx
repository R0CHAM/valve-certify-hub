import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PDFGeneratorProps {
  inspectionId: string;
  valveName: string;
}

export function PDFGenerator({ inspectionId, valveName }: PDFGeneratorProps) {
  const generatePDF = async () => {
    try {
      toast.info("Gerando relatório PDF...");
      
      // Buscar dados da inspeção
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspecoes')
        .select(`
          *,
          valvulas (
            tag, fabricante, modelo, numero_serie, diametro, 
            pressao_abertura, temperatura_operacao, fluido,
            material_corpo, material_internos, localizacao
          )
        `)
        .eq('id', inspectionId)
        .single();

      if (inspectionError) throw inspectionError;

      // Buscar componentes da inspeção
      const { data: components, error: componentsError } = await supabase
        .from('inspecao_componentes')
        .select('*')
        .eq('inspecao_id', inspectionId);

      if (componentsError) throw componentsError;

      // Buscar ações requeridas
      const { data: actions, error: actionsError } = await supabase
        .from('acoes_requeridas')
        .select('*')
        .eq('inspecao_id', inspectionId);

      if (actionsError) throw actionsError;

      // Buscar fotos da inspeção
      const { data: photos, error: photosError } = await supabase
        .from('inspecao_fotos')
        .select('*')
        .eq('inspecao_id', inspectionId)
        .order('etapa', { ascending: true });

      if (photosError) throw photosError;

      // Criar conteúdo HTML para o PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Inspeção - ${valveName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
            .photo-item { text-align: center; }
            .photo-item img { max-width: 100%; height: auto; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RELATÓRIO DE INSPEÇÃO</h1>
            <h2>${inspection.valvulas.tag}</h2>
            <p>Data: ${new Date(inspection.data_inicio).toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="section">
            <div class="section-title">Dados da Válvula</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">TAG:</span> ${inspection.valvulas.tag}</div>
              <div class="info-item"><span class="label">Fabricante:</span> ${inspection.valvulas.fabricante}</div>
              <div class="info-item"><span class="label">Modelo:</span> ${inspection.valvulas.modelo || 'N/A'}</div>
              <div class="info-item"><span class="label">Número de Série:</span> ${inspection.valvulas.numero_serie || 'N/A'}</div>
              <div class="info-item"><span class="label">Diâmetro:</span> ${inspection.valvulas.diametro || 'N/A'}</div>
              <div class="info-item"><span class="label">Pressão de Abertura:</span> ${inspection.valvulas.pressao_abertura || 'N/A'} bar-g</div>
              <div class="info-item"><span class="label">Fluido:</span> ${inspection.valvulas.fluido || 'N/A'}</div>
              <div class="info-item"><span class="label">Localização:</span> ${inspection.valvulas.localizacao || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados da Inspeção</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Tipo de Inspeção:</span> ${inspection.tipo_inspecao}</div>
              <div class="info-item"><span class="label">Data de Início:</span> ${new Date(inspection.data_inicio).toLocaleDateString('pt-BR')}</div>
              <div class="info-item"><span class="label">Data de Conclusão:</span> ${inspection.data_conclusao ? new Date(inspection.data_conclusao).toLocaleDateString('pt-BR') : 'N/A'}</div>
              <div class="info-item"><span class="label">Instrumentos Utilizados:</span> ${inspection.instrumentos_utilizados || 'N/A'}</div>
              <div class="info-item"><span class="label">Pressão Abertura Frio CDTP:</span> ${inspection.pressao_abertura_frio_cdtp || 'N/A'} bar-g</div>
              <div class="info-item"><span class="label">Fluido de Teste:</span> ${inspection.fluido_teste || 'N/A'}</div>
              <div class="info-item"><span class="label">Código do Lacre:</span> ${inspection.codigo_lacre || 'N/A'}</div>
              <div class="info-item"><span class="label">Teste Integridade Juntas:</span> ${inspection.teste_integridade_juntas ? 'Sim' : 'Não'}</div>
              <div class="info-item"><span class="label">Teste Estanqueidade:</span> ${inspection.teste_estanqueidade ? 'Sim' : 'Não'}</div>
              <div class="info-item"><span class="label">Selo VR:</span> ${inspection.selo_vr ? 'Sim' : 'Não'}</div>
            </div>
            ${inspection.observacoes ? `<div class="info-item" style="margin-top: 15px;"><span class="label">Observações:</span><br>${inspection.observacoes}</div>` : ''}
          </div>

          ${components && components.length > 0 ? `
          <div class="section">
            <div class="section-title">Inspeção de Componentes</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Condição</th>
                  <th>Código Condição</th>
                  <th>AGE</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                ${components.map(comp => `
                  <tr>
                    <td>${comp.componente}</td>
                    <td>${comp.condicao || 'N/A'}</td>
                    <td>${comp.codigo_condicao || 'N/A'}</td>
                    <td>${comp.age || 'N/A'}</td>
                    <td>${comp.observacao || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${actions && actions.length > 0 ? `
          <div class="section">
            <div class="section-title">Ações Requeridas</div>
            <ul>
              ${actions.map(action => `<li>${action.acao}${action.observacao ? ` - ${action.observacao}` : ''}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${photos && photos.length > 0 ? `
          <div class="section">
            <div class="section-title">Fotos da Inspeção</div>
            <div class="photo-grid">
              ${photos.map(photo => `
                <div class="photo-item">
                  <img src="${photo.url_foto}" alt="${photo.descricao || photo.etapa}" />
                  <p><strong>${photo.etapa}</strong></p>
                  ${photo.descricao ? `<p>${photo.descricao}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </body>
        </html>
      `;

      // Criar blob e fazer download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Inspecao_${valveName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Gerar PDF
    </Button>
  );
}
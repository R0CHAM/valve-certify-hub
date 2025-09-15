import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoUploadProps {
  inspectionId: string;
  step: {
    id: string;
    name: string;
    description: string;
  };
  inspectionType?: string;
}

interface Photo {
  id: string;
  url: string;
  name: string;
  description: string;
}

const STEP_GUIDELINES = {
  tipo: {
    title: "Tipo de Inspeção",
    instructions: [
      "Definir se é registro ou testes",
      "Selecionar tipo de teste se aplicável",
      "Escolher componentes do teste"
    ]
  },
  chegada: {
    title: "Fotos da Válvula na Chegada",
    instructions: [
      "Foto geral da válvula completa",
      "Placa de identificação/nameplate",
      "Estado geral da válvula",
      "Eventuais danos visíveis"
    ]
  },
  desmontada: {
    title: "Fotos da Válvula Desmontada", 
    instructions: [
      "Corpo da válvula desmontado",
      "Vista dos componentes internos",
      "Estado das roscas",
      "Componentes separados organizados"
    ]
  },
  disco: {
    title: "Fotos do Disco",
    instructions: [
      "Vista frontal do disco",
      "Vista lateral do disco", 
      "Sede do disco",
      "O-rings e vedações internas",
      "Eventuais desgastes ou danos"
    ]
  },
  bocal: {
    title: "Fotos do Bocal",
    instructions: [
      "Vista interna do bocal",
      "Sede do bocal",
      "Roscas do bocal",
      "Estado da superfície"
    ]
  },
  castelo: {
    title: "Fotos do Castelo",
    instructions: [
      "Vista do castelo",
      "Vista do capuz e alavanca (se aplicável)",
      "Vista das roscas",
      "Vista dos flanges",
      "Pontos de oxidação externos (se aplicável)"
    ]
  },
  finalizada: {
    title: "Fotos da Válvula Finalizada",
    instructions: [
      "Válvula montada completa",
      "Plaqueta de identificação",
      "Lacre aplicado"
    ]
  },
  lacre: {
    title: "Fotos do Lacre",
    instructions: [
      "Lacre aplicado na válvula",
      "Código do lacre visível",
      "Posição do lacre",
      "Estado do lacre aplicado"
    ]
  }
};

export function PhotoUpload({ inspectionId, step, inspectionType = "registro" }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const stepGuideline = STEP_GUIDELINES[step.id as keyof typeof STEP_GUIDELINES] || {
    title: step.name,
    instructions: ["Fotos relevantes para esta etapa"]
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${inspectionId}/${step.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('inspecao-fotos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('inspecao-fotos')
          .getPublicUrl(fileName);

        // Save to database
        const { data: photoRecord, error: dbError } = await supabase
          .from('inspecao_fotos')
          .insert({
            inspecao_id: inspectionId,
            etapa: step.id,
            nome_arquivo: file.name,
            url_foto: publicUrl,
            descricao: ''
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return {
          id: photoRecord.id,
          url: publicUrl,
          name: file.name,
          description: ''
        };
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error(`Erro ao fazer upload de ${file.name}`);
        return null;
      }
    });

    const uploadedPhotos = (await Promise.all(uploadPromises)).filter(Boolean) as Photo[];
    setPhotos(prev => [...prev, ...uploadedPhotos]);
    setUploading(false);
    
    if (uploadedPhotos.length > 0) {
      toast.success(`${uploadedPhotos.length} foto(s) carregada(s) com sucesso!`);
    }
  };

  const removePhoto = async (photo: Photo) => {
    try {
      // Remove from database
      const { error } = await supabase
        .from('inspecao_fotos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      // Remove from storage
      const fileName = new URL(photo.url).pathname.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('inspecao-fotos')
          .remove([`${inspectionId}/${step.id}/${fileName}`]);
      }

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Foto removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto');
    }
  };

  const updatePhotoDescription = async (photoId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('inspecao_fotos')
        .update({ descricao: description })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, description } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error);
      toast.error('Erro ao atualizar descrição');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {stepGuideline.title}
        </CardTitle>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-800 mb-2">📋 Orientações para fotos:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {stepGuideline.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {inspectionType === "testes" ? "Adicionar Fotos/Vídeos" : "Adicionar Fotos"}
            </p>
            <p className="text-sm text-muted-foreground">
              Arraste e solte {inspectionType === "testes" ? "os arquivos" : "as fotos"} aqui ou clique para selecionar
            </p>
            {inspectionType === "testes" && (
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <Camera className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs text-blue-700">Fotos</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="h-6 w-6 mx-auto mb-1 flex items-center justify-center text-green-600 text-lg">🎥</div>
                  <span className="text-xs text-green-700">Vídeos</span>
                </div>
              </div>
            )}
            <p className="text-xs text-blue-600 font-medium">
              💡 Siga as orientações acima para garantir {inspectionType === "testes" ? "documentação" : "fotos"} de qualidade
            </p>
          </div>
          <div className="mt-4">
            <Input
              type="file"
              multiple
              accept={inspectionType === "testes" ? "image/*,video/*" : "image/*"}
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button type="button" disabled={uploading}>
                {uploading ? (
                  "Carregando..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar {inspectionType === "testes" ? "Arquivos" : "Fotos"}
                  </>
                )}
              </Button>
            </Label>
          </div>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Fotos Carregadas ({photos.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removePhoto(photo)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span className="text-sm font-medium truncate">{photo.name}</span>
                      </div>
                      <div>
                        <Label htmlFor={`description-${photo.id}`} className="text-xs">
                          Descrição (opcional)
                        </Label>
                        <Textarea
                          id={`description-${photo.id}`}
                          value={photo.description}
                          onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
                          placeholder="Adicione uma descrição da foto..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma foto carregada para esta etapa</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
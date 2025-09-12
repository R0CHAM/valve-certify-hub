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
}

interface Photo {
  id: string;
  url: string;
  name: string;
  description: string;
}

export function PhotoUpload({ inspectionId, step }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
          {step.name} - {step.description}
        </CardTitle>
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
            <p className="text-lg font-medium">Adicionar Fotos</p>
            <p className="text-sm text-muted-foreground">
              Arraste e solte as fotos aqui ou clique para selecionar
            </p>
          </div>
          <div className="mt-4">
            <Input
              type="file"
              multiple
              accept="image/*"
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
                    Selecionar Fotos
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
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            LESER <span className="text-primary">Certificação</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Sistema completo para certificação digital de válvulas de segurança, 
            com controle de qualidade, auditoria e acesso via QR Code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/auth">
                Acessar Sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Certificação Digital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Geração automática de certificados digitais com QR Code único para cada válvula, 
                garantindo autenticidade e rastreabilidade.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-primary" />
                Fluxo de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Processo estruturado de revisão e aprovação com controle de permissões 
                por função: técnicos, escritório e clientes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 text-primary" />
                Portal do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesso personalizado para clientes visualizarem histórico de válvulas, 
                certificados e alertas de vencimento.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Status da Implementação</CardTitle>
              <CardDescription>
                Acompanhe o progresso de desenvolvimento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium">Fase 1 - Fundação</span>
                  <span className="ml-auto text-green-500">Concluída ✓</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium">Fase 2 - Gestão de Válvulas</span>
                  <span className="ml-auto text-yellow-500">Em Desenvolvimento</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                  <span className="font-medium">Fase 3 - Fluxo de Aprovação</span>
                  <span className="ml-auto text-muted-foreground">Planejada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

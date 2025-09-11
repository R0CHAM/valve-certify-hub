import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Building2, Wrench, FileCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'escritorio': return 'default';
      case 'tecnico': return 'secondary';
      case 'cliente': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'escritorio': return 'Escritório';
      case 'tecnico': return 'Técnico';
      case 'cliente': return 'Cliente';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Settings;
      case 'escritorio': return Building2;
      case 'tecnico': return Wrench;
      case 'cliente': return User;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon(profile?.role || '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <RoleIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LESER Certificação</h1>
                <p className="text-sm text-muted-foreground">Sistema de Certificação de Válvulas</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{profile?.nome}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={getRoleColor(profile?.role || '')}>
                  {getRoleLabel(profile?.role || '')}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo, {profile?.nome}!
          </h2>
          <p className="text-muted-foreground">
            Aqui está o resumo das suas atividades no sistema.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Válvulas Ativas</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Válvulas registradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Certificados emitidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ordens de serviço pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Certificados vencendo em 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Funcionalidades principais baseadas no seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.role === 'admin' && (
                <>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Gerenciar Empresas
                  </Button>
                </>
              )}
              
              {(profile?.role === 'tecnico' || profile?.role === 'escritorio' || profile?.role === 'admin') && (
                <>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/valvulas">
                      <Wrench className="mr-2 h-4 w-4" />
                      Gestão de Válvulas
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="mr-2 h-4 w-4" />
                    Nova Ordem de Serviço
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Aprovar Certificados
                  </Button>
                </>
              )}
              
              {profile?.role === 'cliente' && (
                <>
                  <Button className="w-full justify-start" variant="outline">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Meus Certificados
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="mr-2 h-4 w-4" />
                    Minhas Válvulas
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Status atual da implementação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium text-green-600">✅ Fase 1 - Fundação</p>
                  <p className="text-muted-foreground ml-4">
                    Autenticação e estrutura básica implementadas
                  </p>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium text-green-600">✅ Fase 2 - Gestão de Válvulas</p>
                  <p className="text-muted-foreground ml-4">
                    CRUD completo de válvulas com upload de fotos por etapa
                  </p>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium text-muted-foreground">⏳ Fase 3 - Fluxo de Aprovação</p>
                  <p className="text-muted-foreground ml-4">
                    Interface de revisão e aprovação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import { useAuth } from '../../lib/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Zap, Workflow, Settings, Sparkles, TrendingUp, Activity } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="navbar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-xl font-bold text-primary cursor-pointer" 
            data-testid="app-title"
            onClick={() => navigate('/')}
          >
            DTA Mind
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={location === '/' || location === '/dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              data-testid="nav-dashboard"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={location === '/workflow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/workflow')}
              data-testid="nav-workflows"
            >
              <Workflow className="mr-2 h-4 w-4" />
              Workflows
            </Button>
            <Button
              variant={location === '/executions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/executions')}
              data-testid="nav-executions"
            >
              <Activity className="mr-2 h-4 w-4" />
              Executions
            </Button>
            <Button
              variant={location === '/test' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/test')}
              data-testid="nav-test"
            >
              <Zap className="mr-2 h-4 w-4" />
              Test API
            </Button>
            <Button
              variant={location === '/templates' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/templates')}
              data-testid="nav-templates"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button
              variant={location === '/settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/settings')}
              data-testid="nav-settings"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid="user-welcome">
              Welcome, {user.username}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback data-testid="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} data-testid="logout-item">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
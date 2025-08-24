import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Key, Zap, Shield, Database, Bot, Globe, Code } from 'lucide-react';
import APIKeysPanel from '@/components/ui/api-keys-panel';
import { WorkflowTriggerPanel } from '@/components/ui/workflow-trigger-panel';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');

  const settingsTabs = [
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: Key,
      description: 'Configure your API keys for AI services',
      badge: 'Required'
    },
    {
      id: 'workflow-triggers',
      label: 'Workflow Triggers',
      icon: Zap,
      description: 'Start and manage your AI workflows',
      badge: 'New'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Security settings and access control',
      badge: 'Coming Soon'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Database,
      description: 'Connect external services and databases',
      badge: 'Coming Soon'
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your AgentFlow application and manage your AI workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Bot className="h-3 w-3 mr-1" />
            AgentFlow v1.0
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">API Keys</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Workflows</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">AI Models</p>
                <p className="text-2xl font-bold">5+</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Node Types</p>
                <p className="text-2xl font-bold">15+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && (
                <Badge variant={tab.badge === 'Required' ? 'destructive' : 'secondary'} className="text-xs">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <APIKeysPanel />
        </TabsContent>

        <TabsContent value="workflow-triggers" className="space-y-6">
          <WorkflowTriggerPanel />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security settings and access control for your AgentFlow application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Features Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced security features including user management, role-based access control, 
                  and audit logging will be available in future updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>
                Connect to external services, databases, and third-party applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integration Hub Coming Soon</h3>
                <p className="text-muted-foreground">
                  Connect to Slack, Discord, Notion, Airtable, and many more services 
                  to automate your workflows across platforms.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Separator />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© 2024 AgentFlow. All rights reserved.</span>
          <span>•</span>
          <span>Built with React, TypeScript, and Tailwind CSS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Documentation
          </Button>
          <Button variant="ghost" size="sm">
            Support
          </Button>
          <Button variant="ghost" size="sm">
            Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}

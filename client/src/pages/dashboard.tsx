import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Settings, 
  Zap, 
  Bot, 
  MessageSquare, 
  FileText, 
  Database,
  Globe,
  Code,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  Workflow,
  Key,
  Shield
} from 'lucide-react';
import { useLocation } from 'wouter';

interface WorkflowStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  executions: number;
  successRate: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant: 'default' | 'secondary' | 'outline';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 12,
    active: 8,
    draft: 3,
    archived: 1,
    executions: 156,
    successRate: 94.2
  });

  const [recentWorkflows, setRecentWorkflows] = useState([
    { id: '1', name: 'Customer Support Agent', status: 'active', lastRun: '2 hours ago', executions: 45 },
    { id: '2', name: 'Content Generator', status: 'active', lastRun: '1 day ago', executions: 23 },
    { id: '3', name: 'Document Q&A System', status: 'draft', lastRun: 'Never', executions: 0 },
    { id: '4', name: 'Web Research Agent', status: 'active', lastRun: '3 hours ago', executions: 67 }
  ]);

  const [, navigate] = useLocation();

  const quickActions: QuickAction[] = [
    {
      id: 'new-workflow',
      title: 'Create New Workflow',
      description: 'Start building a new automation workflow from scratch',
      icon: <Plus className="h-6 w-6" />,
      action: () => navigate('/workflow-builder'),
      variant: 'default'
    },
    {
      id: 'use-template',
      title: 'Use Template',
      description: 'Choose from our collection of professional templates',
      icon: <Sparkles className="h-6 w-6" />,
      action: () => navigate('/templates'),
      variant: 'secondary'
    },
    {
      id: 'manage-keys',
      title: 'Manage API Keys',
      description: 'Configure your API keys for AI services',
      icon: <Key className="h-6 w-6" />,
      action: () => navigate('/settings'),
      variant: 'outline'
    },
    {
      id: 'view-executions',
      title: 'View Executions',
      description: 'Monitor your workflow execution history',
      icon: <Activity className="h-6 w-6" />,
      action: () => navigate('/executions'),
      variant: 'outline'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to AgentFlow</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your professional workflow automation platform. Build, deploy, and manage AI-powered workflows with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button 
                  variant={action.variant} 
                  className="w-full"
                  onClick={action.action}
                >
                  {action.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.draft} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.executions}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.executions} successful executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              AI models, vector stores, tools
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Recent Workflows
                </CardTitle>
                <CardDescription>
                  Your most recently created or modified workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{workflow.name}</h4>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last run: {workflow.lastRun} • {workflow.executions} executions
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/workflow/${workflow.id}`)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/workflow-builder')}>
                  View All Workflows
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  Key metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow Efficiency</span>
                    <span className="text-sm text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm text-blue-600">1.2s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Resource Usage</span>
                    <span className="text-sm text-orange-600">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Workflows</CardTitle>
              <CardDescription>
                Manage and monitor all your workflow automations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Workflow Management</h3>
                <p className="text-muted-foreground mb-4">
                  View, edit, and manage all your workflows in one place
                </p>
                <Button onClick={() => navigate('/workflow-builder')}>
                  Go to Workflow Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Monitor your workflow executions and system activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Activity Monitoring</h3>
                <p className="text-muted-foreground mb-4">
                  Track execution history, performance metrics, and system events
                </p>
                <Button variant="outline">
                  View Activity Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Deep dive into your workflow performance and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Analyze patterns, identify bottlenecks, and optimize your workflows
                </p>
                <Button variant="outline">
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Powered by AgentFlow</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Professional workflow automation platform for modern businesses
        </p>
      </div>
    </div>
  );
}

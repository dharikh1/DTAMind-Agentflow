import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  Calendar,
  Workflow,
  User,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Execution {
  id: string;
  workflowName: string;
  status: 'completed' | 'failed' | 'running' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  user: string;
  input?: any;
  output?: any;
  error?: string;
  nodesExecuted: number;
  totalNodes: number;
}

const MOCK_EXECUTIONS: Execution[] = [
  {
    id: 'exec-001',
    workflowName: 'Customer Support Agent',
    status: 'completed',
    startTime: '2024-01-25T10:30:00Z',
    endTime: '2024-01-25T10:32:15Z',
    duration: 135,
    user: 'john.doe',
    nodesExecuted: 8,
    totalNodes: 8
  },
  {
    id: 'exec-002',
    workflowName: 'Content Generator',
    status: 'failed',
    startTime: '2024-01-25T09:15:00Z',
    endTime: '2024-01-25T09:16:30Z',
    duration: 90,
    user: 'jane.smith',
    error: 'API rate limit exceeded',
    nodesExecuted: 3,
    totalNodes: 5
  },
  {
    id: 'exec-003',
    workflowName: 'Document Q&A System',
    status: 'running',
    startTime: '2024-01-25T11:00:00Z',
    user: 'admin',
    nodesExecuted: 6,
    totalNodes: 12
  },
  {
    id: 'exec-004',
    workflowName: 'Web Research Agent',
    status: 'completed',
    startTime: '2024-01-25T08:45:00Z',
    endTime: '2024-01-25T08:48:20Z',
    duration: 200,
    user: 'john.doe',
    nodesExecuted: 10,
    totalNodes: 10
  },
  {
    id: 'exec-005',
    workflowName: 'AI Code Assistant',
    status: 'pending',
    startTime: '2024-01-25T12:00:00Z',
    user: 'jane.smith',
    nodesExecuted: 0,
    totalNodes: 15
  }
];

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>(MOCK_EXECUTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = execution.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         execution.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: executions.length,
    completed: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
    running: executions.filter(e => e.status === 'running').length,
    pending: executions.filter(e => e.status === 'pending').length,
    successRate: executions.length > 0 ? 
      Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100) : 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your workflow executions in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successful runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Failed executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Find specific executions by status, date, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows, users, or execution IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>
            Detailed view of all workflow executions with status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Execution ID</th>
                  <th className="text-left p-3 font-medium">Workflow</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Start Time</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-left p-3 font-medium">Progress</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {execution.id}
                      </code>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{execution.workflowName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(execution.status)}>
                        {getStatusIcon(execution.status)}
                        <span className="ml-1 capitalize">{execution.status}</span>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{execution.user}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(execution.startTime)}
                    </td>
                    <td className="p-3">
                      {execution.duration ? (
                        <span className="text-sm">{formatDuration(execution.duration)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(execution.nodesExecuted / execution.totalNodes) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {execution.nodesExecuted}/{execution.totalNodes}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedExecution(execution)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {execution.status === 'running' && (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExecutions.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No executions found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Details Modal */}
      {selectedExecution && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-background border-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Execution Details</CardTitle>
              <CardDescription>
                {selectedExecution.workflowName} - {selectedExecution.id}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExecution(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge className={`mt-1 ${getStatusColor(selectedExecution.status)}`}>
                  {getStatusIcon(selectedExecution.status)}
                  <span className="ml-1 capitalize">{selectedExecution.status}</span>
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">User</label>
                <p className="text-sm">{selectedExecution.user}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <p className="text-sm">{formatDate(selectedExecution.startTime)}</p>
              </div>
              {selectedExecution.endTime && (
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <p className="text-sm">{formatDate(selectedExecution.endTime)}</p>
                </div>
              )}
              {selectedExecution.duration && (
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="text-sm">{formatDuration(selectedExecution.duration)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Progress</label>
                <p className="text-sm">
                  {selectedExecution.nodesExecuted} / {selectedExecution.totalNodes} nodes
                </p>
              </div>
            </div>

            {selectedExecution.error && (
              <div>
                <label className="text-sm font-medium text-red-600">Error</label>
                <p className="text-sm bg-red-50 p-2 rounded border text-red-700">
                  {selectedExecution.error}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedExecution(null)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

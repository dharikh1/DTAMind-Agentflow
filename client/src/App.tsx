import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth";
import { Navbar } from "./components/layout/navbar";
import WorkflowBuilder from "@/pages/workflow-builder";
import { AuthPage } from "@/pages/auth";
import { TestPage } from "@/pages/test";
import { SettingsPage } from "@/pages/settings";
import WorkflowTemplatesPage from "@/pages/workflow-templates";
import DashboardPage from "@/pages/dashboard";
import ExecutionsPage from "@/pages/executions";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/workflow/:id?" component={WorkflowBuilder} />
          <Route path="/templates" component={WorkflowTemplatesPage} />
          <Route path="/executions" component={ExecutionsPage} />
          <Route path="/test" component={TestPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

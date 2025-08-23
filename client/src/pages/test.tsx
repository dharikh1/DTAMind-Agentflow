import { TestPanel } from '../components/workflow/test-panel';

export function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4" data-testid="test-page">
      <div className="container mx-auto py-8">
        <TestPanel />
      </div>
    </div>
  );
}
import { useState } from 'react';
import { LoginForm } from '../components/auth/login-form';
import { RegisterForm } from '../components/auth/register-form';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4" data-testid="auth-page">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}
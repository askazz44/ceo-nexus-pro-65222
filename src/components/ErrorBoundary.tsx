import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLanguage } from '@/lib/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const language = getLanguage();
      const isIt = language === 'it';
      
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-center">
                {isIt ? 'Qualcosa è andato storto' : 'Something went wrong'}
              </CardTitle>
              <CardDescription className="text-center">
                {isIt ? 'Si è verificato un errore imprevisto' : 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 rounded bg-muted text-xs font-mono overflow-auto max-h-40">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.href = '/'} className="w-full">
                  {isIt ? 'Torna alla Home' : 'Go to Home'}
                </Button>
                <Button 
                  onClick={() => this.setState({ hasError: false })} 
                  variant="outline"
                  className="w-full"
                >
                  {isIt ? 'Riprova' : 'Try again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
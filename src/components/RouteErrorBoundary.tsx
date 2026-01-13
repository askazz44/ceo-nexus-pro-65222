import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLanguage } from '@/lib/i18n';

interface Props {
  children: ReactNode;
  fallbackPath?: string;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`RouteErrorBoundary [${this.props.routeName || 'unknown'}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const language = getLanguage();
      const isIt = language === 'it';
      const { routeName, fallbackPath = '/dashboard' } = this.props;
      
      return (
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <Card className="max-w-md w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle>
                {isIt ? 'Errore nel caricamento' : 'Loading Error'}
              </CardTitle>
              <CardDescription>
                {isIt 
                  ? `Si è verificato un errore${routeName ? ` nella pagina ${routeName}` : ''}`
                  : `An error occurred${routeName ? ` on the ${routeName} page` : ''}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-32 border">
                  <p className="font-semibold text-destructive mb-1">Error:</p>
                  {this.state.error.message}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isIt ? 'Riprova' : 'Try Again'}
                </Button>
                <Button 
                  onClick={() => window.location.href = fallbackPath} 
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {isIt ? 'Torna alla Dashboard' : 'Back to Dashboard'}
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

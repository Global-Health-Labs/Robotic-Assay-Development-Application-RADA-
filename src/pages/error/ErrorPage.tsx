import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Link, useRouteError } from 'react-router-dom';

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  const errorMessage = error?.statusText || error?.message || 'Something went wrong';

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Oops!</h1>
      <h2 className="text-xl font-semibold">An error occurred</h2>
      <p className="text-muted-foreground">{errorMessage}</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}

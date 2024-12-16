import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
}

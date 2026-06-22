import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="p-3 bg-red-50 text-xifoz-danger rounded-full border border-red-100/50">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-xifoz-text">Admin Resource Not Found</h3>
        <p className="text-sm text-xifoz-text-secondary max-w-sm">
          The administrative endpoint you are trying to reach does not exist or has been relocated.
        </p>
      </div>
      <Link to="/admin">
        <Button className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg px-6 text-sm">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

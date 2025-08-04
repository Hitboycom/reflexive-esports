import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

const Transactions = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <History className="h-8 w-8" />
          <span>Transaction History</span>
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete transaction history with filtering and pagination will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;


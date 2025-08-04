import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const CreateContest = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8" />
          <span>Create Contest</span>
        </h1>
        <p className="text-muted-foreground">
          Set up a new gaming contest for others to join
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contest Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contest creation form will be implemented here. This includes fields for:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-1 text-muted-foreground">
            <li>Contest title</li>
            <li>Game type selection</li>
            <li>Entry fee</li>
            <li>Prize pool</li>
            <li>Maximum slots</li>
            <li>Match date and time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateContest;


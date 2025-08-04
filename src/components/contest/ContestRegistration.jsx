import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ContestRegistrationForm from './ContestRegistrationForm';

const ContestRegistration = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { token, API_BASE } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contests/${contestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContest(data);
      } else {
        console.error('Failed to fetch contest');
        navigate('/contests');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      navigate('/contests');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = (registrationData) => {
    // Refresh contest data to update slot count
    fetchContest();
    // Redirect to contest lobby after successful registration
    navigate(`/contests/${contestId}/lobby`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Contest Not Found</h1>
        <p className="text-muted-foreground">The contest you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/contests')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/contests/${contestId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contest
        </Button>
      </div>

      {/* Contest Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6" />
            <span>{contest.title}</span>
          </CardTitle>
          <CardDescription>
            {contest.game_name} - {contest.game_type}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <Trophy className="h-4 w-4" />
                <span>Prize Pool</span>
              </div>
              <div className="text-lg font-semibold">{contest.prize_pool}₹</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Entry Fee</span>
              </div>
              <div className="text-lg font-semibold">{contest.entry_fee}₹</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span>Participants</span>
              </div>
              <div className="text-lg font-semibold">{contest.current_slots}/{contest.max_slots}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span>Match Time</span>
              </div>
              <div className="text-sm font-semibold">
                {new Date(contest.match_time).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Badge variant={contest.status === 'open' ? 'default' : 'secondary'}>
              {contest.status}
            </Badge>
            {contest.registration_locked && (
              <Badge variant="destructive">Registration Locked</Badge>
            )}
          </div>
          
          {contest.contest_info && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Contest Information</h4>
              <p className="text-sm text-muted-foreground">{contest.contest_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      {contest.status === 'open' && !contest.registration_locked ? (
        <ContestRegistrationForm 
          contest={contest} 
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Registration Closed</h3>
            <p className="text-muted-foreground">
              {contest.registration_locked 
                ? 'Registration has been locked by the admin.'
                : 'This contest is no longer accepting new registrations.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContestRegistration;



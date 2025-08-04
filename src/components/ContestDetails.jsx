import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  GamepadIcon,
  LogIn
} from 'lucide-react';
import LoadingSpinner from "./ui/LoadingSpinner";

const ContestDetails = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { token, API_BASE } = useAuth();
  const [contest, setContest] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContest();
    checkUserRegistration();
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

  const checkUserRegistration = async () => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRegistration(data.registration);
      } else {
        // User is not registered, which is fine
        setUserRegistration(null);
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      setUserRegistration(null);
    }
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
          onClick={() => navigate('/contests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contests
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

          <div className="mt-6">
            {userRegistration ? (
              <Button 
                onClick={() => navigate(`/contests/${contest.id}/lobby`)}
                className="w-full"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Enter Lobby
              </Button>
            ) : contest.status === 'open' && !contest.registration_locked ? (
              <Button 
                onClick={() => navigate(`/contests/${contest.id}/register`)}
                className="w-full"
              >
                <GamepadIcon className="h-5 w-5 mr-2" />
                Join Contest
              </Button>
            ) : (
              <Button 
                disabled 
                className="w-full"
              >
                Registration Closed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContestDetails;



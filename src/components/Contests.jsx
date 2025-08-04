import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Wallet,
  Award,
  Plus,
  Calendar
} from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

const Contests = () => {
  const { token, API_BASE, user } = useAuth();
  const [contests, setContests] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    fetchContests();
    fetchUserRegistrations();
  }, [statusFilter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contests?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContests(data);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Failed to fetch user registrations:', error);
    }
  };

  const isUserRegistered = (contestId) => {
    return userRegistrations.some(reg => reg.contest_id === contestId);
  };

  const filteredContests = contests.filter(contest =>
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.game_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'full': return 'bg-yellow-500';
      case 'started': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'full': return 'Full';
      case 'started': return 'Started';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'full', label: 'Full' },
    { value: 'started', label: 'Started' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8" />
          <span>Contests</span>
        </h1>
        <p className="text-muted-foreground">
          Browse and join gaming contests to compete for prizes
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Find Contests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or game type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Link to="/contests/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Contest</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Contest Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredContests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No contests found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No contests match "${searchTerm}"`
                : `No ${statusFilter} contests available`
              }
            </p>
            <Link to="/contests/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create the first contest
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <Card key={contest.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(contest.status)}`} />
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Badge variant="secondary">{contest.game_type}</Badge>
                  <Badge variant="outline">{getStatusText(contest.status)}</Badge>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.entry_fee}₹</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.prize_pool}₹</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.current_slots}/{contest.max_slots}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{formatDate(contest.match_time)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Created by {contest.creator_username || 'Unknown'}
                </div>
                
                {/* Progress bar for slots */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slots filled</span>
                    <span>{contest.current_slots}/{contest.max_slots}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(contest.current_slots / contest.max_slots) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <Link to={`/contests/${contest.id}`} className="block">
                  <Button 
                    className="w-full" 
                    variant={contest.status === 'open' && !isUserRegistered(contest.id) ? 'default' : 'outline'}
                    disabled={contest.status === 'completed'}
                  >
                    {isUserRegistered(contest.id) 
                      ? (contest.status === 'open' || contest.status === 'full' ? 'See Lobby' : 'View Details')
                      : (contest.status === 'open' ? 'Join Contest' : 'View Details')
                    }
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results summary */}
      {!loading && filteredContests.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredContests.length} contest{filteredContests.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default Contests;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Wallet, 
  Plus, 
  Users, 
  Clock, 
  TrendingUp,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

const Dashboard = () => {
  const { user, token, API_BASE } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentContests, setRecentContests] = useState([]);
  const [myContests, setMyContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet stats
      const walletResponse = await fetch(`${API_BASE}/wallet/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch recent contests
      const contestsResponse = await fetch(`${API_BASE}/contests?status=open`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch my contests
      const myContestsResponse = await fetch(`${API_BASE}/my-contests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setStats(walletData);
      }
      
      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json();
        setRecentContests(contestsData.slice(0, 6)); // Show only first 6
      }
      
      if (myContestsResponse.ok) {
        const myContestsData = await myContestsResponse.json();
        setMyContests(myContestsData);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user.username}! 🎮
        </h1>
        <p className="text-muted-foreground">
          Ready to dominate the competition? Check out the latest contests below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {user.wallet_balance?.toFixed(2)}₹
            </div>
            <p className="text-xs text-muted-foreground">
              Available for contests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_spent?.toFixed(2) || '0.00'}₹
            </div>
            <p className="text-xs text-muted-foreground">
              Contest entry fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Won</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_won?.toFixed(2) || '0.00'}₹
            </div>
            <p className="text-xs text-muted-foreground">
              Prize winnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats?.net_profit >= 0 ? '+' : ''}{stats?.net_profit?.toFixed(2) || '0.00'}₹
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Get started with these common actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/contests/create">
              <Button className="w-full h-20 flex flex-col space-y-2">
                <Trophy className="h-6 w-6" />
                <span>Create Contest</span>
              </Button>
            </Link>
            
            <Link to="/contests">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Browse Contests</span>
              </Button>
            </Link>
            
            <Link to="/wallet">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Wallet className="h-6 w-6" />
                <span>Add Funds</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Open Contests</span>
            </CardTitle>
            <CardDescription>
              Join these contests before they fill up
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentContests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open contests available</p>
                <Link to="/contests/create" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    Create the first one
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContests.map((contest) => (
                  <div key={contest.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{contest.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {contest.game_type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Wallet className="h-3 w-3" />
                        <span>{contest.entry_fee}₹</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3" />
                        <span>{contest.prize_pool}₹</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{contest.current_slots}/{contest.max_slots}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(contest.match_time)}</span>
                      </div>
                    </div>
                    
                    <Link to={`/contests/${contest.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
                
                <Link to="/contests">
                  <Button variant="outline" className="w-full">
                    View All Contests
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>My Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest contest participations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myContests.joined_contests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <Link to="/contests" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    Join your first contest
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myContests.joined_contests?.slice(0, 5).map((item) => (
                  <div key={item.participation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.contest.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(item.contest.status)}`} />
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      <p>Game: {item.contest.game_type}</p>
                      <p>Joined: {formatDate(item.participation.joined_at)}</p>
                      {item.participation.position && (
                        <p className="text-primary font-medium">
                          Position: #{item.participation.position}
                        </p>
                      )}
                      {item.participation.prize_won > 0 && (
                        <p className="text-green-600 font-medium">
                          Won: {item.participation.prize_won}₹
                        </p>
                      )}
                    </div>
                    
                    <Link to={`/contests/${item.contest.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Contest
                      </Button>
                    </Link>
                  </div>
                ))}
                
                <Link to="/profile">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


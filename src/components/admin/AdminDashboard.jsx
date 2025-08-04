import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Trophy, 
  Activity, 
  Plus,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminDashboard = () => {
  const { token, API_BASE } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.statistics || {};

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8" />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Manage contests, users, and monitor platform activity
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/contests/create">
              <Button className="w-full h-16 flex flex-col items-center space-y-2 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <Trophy className="h-6 w-6" />
                <span>Create Contest</span>
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center space-y-2 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link to="/admin/contests">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center space-y-2 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <Settings className="h-6 w-6" />
                <span>Manage Contests</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_contests || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time contests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_contests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_registrations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Contest entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Recent Contests</span>
            </CardTitle>
            <CardDescription>
              Latest contests created on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_contests?.length > 0 ? (
                dashboardData.recent_contests.map((contest) => (
                  <div key={contest.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{contest.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{contest.game_type}</Badge>
                        <span>{contest.current_slots}/{contest.max_slots} slots</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={contest.status === 'open' ? 'default' : 'secondary'}>
                        {contest.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {contest.entry_fee}₹
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent contests
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Recent Registrations</span>
            </CardTitle>
            <CardDescription>
              Latest contest registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_registrations?.length > 0 ? (
                dashboardData.recent_registrations.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{item.user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.contest.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{item.contest.game_type}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.registration.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent registrations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


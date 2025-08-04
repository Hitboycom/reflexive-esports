import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet as WalletIcon, 
  Plus, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  History,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

const Wallet = () => {
  const { user, token, API_BASE, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet stats
      const statsResponse = await fetch(`${API_BASE}/wallet/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch recent transactions
      const transactionsResponse = await fetch(`${API_BASE}/wallet/transactions?per_page=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const fundAmount = parseFloat(amount);
    
    if (!fundAmount || fundAmount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (fundAmount > 10000) {
      setMessage('Maximum amount is 10,000₹ per transaction');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: fundAmount,
          payment_method: 'mock_payment'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully added ${fundAmount}₹ to your wallet!`);
        setMessageType('success');
        setAmount('');
        
        // Update user balance in context
        updateUser({
          ...user,
          wallet_balance: data.new_balance
        });
        
        // Refresh wallet data
        fetchWalletData();
      } else {
        setMessage(data.message || 'Failed to add funds');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to add funds. Please try again.');
      setMessageType('error');
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'add_funds':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'join_contest':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'prize_reward':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'add_funds':
      case 'prize_reward':
        return 'text-green-600';
      case 'join_contest':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <WalletIcon className="h-8 w-8" />
          <span>Wallet</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your rupees and view transaction history
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <WalletIcon className="h-5 w-5" />
            <span>Current Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            {user.wallet_balance?.toFixed(2)}₹
          </div>
          <p className="text-muted-foreground">
            Available for contest entries and withdrawals
          </p>
        </CardContent>
      </Card>

      {/* Add Funds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Funds</span>
          </CardTitle>
          <CardDescription>
            Add rupees to your wallet using our secure payment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddFunds} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                min="1"
                max="10000"
                step="0.01"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick amounts</Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={loading}
                  >
                    {quickAmount}₹
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading || !amount} className="w-full">
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Processing...' : `Add ${amount || '0'}₹`}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💳 This is a demo payment system. In production, this would integrate with real payment providers like Stripe or Razorpay.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Added</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total_added?.toFixed(2)}₹
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime deposits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Math.abs(stats.total_spent)?.toFixed(2)}₹
              </div>
              <p className="text-xs text-muted-foreground">
                Contest entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.net_profit >= 0 ? '+' : ''}{stats.net_profit?.toFixed(2)}₹
              </div>
              <p className="text-xs text-muted-foreground">
                Winnings - Entries
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
          <CardDescription>
            Your latest wallet activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Add funds or join a contest to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount}₹
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full" asChild>
                <a href="/transactions">View All Transactions</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;


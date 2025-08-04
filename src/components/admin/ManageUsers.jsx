import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  DollarSign,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const ManageUsers = () => {
  const { token, API_BASE } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [walletAdjustment, setWalletAdjustment] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const toggleAdminStatus = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Admin status updated successfully');
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to update admin status: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setEditForm({
      username: user.username,
      email: user.email,
      wallet_balance: user.wallet_balance,
      is_admin: user.is_admin
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const saveUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        alert('User updated successfully');
        setEditingUser(null);
        setEditForm({});
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const adjustWallet = async (userId, operation) => {
    const amount = walletAdjustment[userId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/wallet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          operation: operation,
          reason: `Admin ${operation} - ${amount}₹`
        }),
      });

      if (response.ok) {
        alert(`Wallet ${operation === 'add' ? 'credited' : 'debited'} successfully`);
        setWalletAdjustment({ ...walletAdjustment, [userId]: '' });
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to adjust wallet: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      alert('Failed to adjust wallet');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <Users className="h-8 w-8" />
          <span>Manage Users</span>
        </h1>
        <p className="text-muted-foreground">
          View, edit, and manage user accounts
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                {editingUser === user.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`username-${user.id}`}>Username</Label>
                        <Input
                          id={`username-${user.id}`}
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${user.id}`}>Email</Label>
                        <Input
                          id={`email-${user.id}`}
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`wallet-${user.id}`}>Wallet Balance</Label>
                        <Input
                          id={`wallet-${user.id}`}
                          type="number"
                          step="0.01"
                          value={editForm.wallet_balance}
                          onChange={(e) => setEditForm({ ...editForm, wallet_balance: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`admin-${user.id}`}
                          checked={editForm.is_admin}
                          onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                        />
                        <Label htmlFor={`admin-${user.id}`}>Admin Privileges</Label>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => saveUser(user.id)}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        {user.is_admin && (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{user.wallet_balance}₹</span>
                        </span>
                        <span>ID: {user.id}</span>
                        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Wallet Adjustment */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={walletAdjustment[user.id] || ''}
                          onChange={(e) => setWalletAdjustment({ ...walletAdjustment, [user.id]: e.target.value })}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustWallet(user.id, 'add')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustWallet(user.id, 'subtract')}
                        >
                          <Minus className="h-3 w-3 mr-1" />
                          Subtract
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id)}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Make Admin
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;


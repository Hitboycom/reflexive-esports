import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trophy, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  Search,
  Calendar,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const ManageContests = () => {
  const { token, API_BASE } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContest, setEditingContest] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    fetchContests();
  }, []);

  const joinContestAsAdmin = async (contestId) => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body for admin registration
      });

      if (response.ok) {
        const data = await response.json();
        alert('Successfully joined contest as admin for monitoring');
        fetchContests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to join contest: ${error.error}`);
      }
    } catch (error) {
      console.error('Error joining contest:', error);
      alert('Failed to join contest');
    }
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/contests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContests(data.contests || []);
      } else {
        console.error('Failed to fetch contests');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (contestId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/contests/${contestId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants({ ...participants, [contestId]: data.participants || [] });
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const deleteContest = async (contestId) => {
    if (!confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/contests/${contestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Contest deleted successfully');
        fetchContests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to delete contest: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Failed to delete contest');
    }
  };

  const toggleContestLock = async (contestId, currentLockStatus) => {
    try {
      const response = await fetch(`${API_BASE}/admin/contests/${contestId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locked: !currentLockStatus }),
      });

      if (response.ok) {
        alert(`Contest registration ${!currentLockStatus ? 'locked' : 'unlocked'} successfully`);
        fetchContests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to toggle contest lock: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling contest lock:', error);
      alert('Failed to toggle contest lock');
    }
  };

  const kickParticipant = async (contestId, userId) => {
    if (!confirm('Are you sure you want to remove this participant from the contest?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/contests/${contestId}/participants/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Participant removed successfully');
        fetchParticipants(contestId); // Refresh participants
        fetchContests(); // Refresh contests to update slot count
      } else {
        const error = await response.json();
        alert(`Failed to remove participant: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant');
    }
  };

  const startEditing = (contest) => {
    setEditingContest(contest.id);
    setEditForm({
      title: contest.title,
      game_name: contest.game_name,
      game_type: contest.game_type,
      entry_fee: contest.entry_fee,
      prize_pool: contest.prize_pool,
      max_slots: contest.max_slots,
      match_time: contest.match_time ? new Date(contest.match_time).toISOString().slice(0, 16) : '',
      contest_info: contest.contest_info || '',
      status: contest.status
    });
  };

  const cancelEditing = () => {
    setEditingContest(null);
    setEditForm({});
  };

  const saveContest = async (contestId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/contests/${contestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          match_time: editForm.match_time ? new Date(editForm.match_time).toISOString() : null
        }),
      });

      if (response.ok) {
        alert('Contest updated successfully');
        setEditingContest(null);
        setEditForm({});
        fetchContests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to update contest: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating contest:', error);
      alert('Failed to update contest');
    }
  };

  const filteredContests = contests.filter(contest =>
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.game_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Trophy className="h-8 w-8" />
          <span>Manage Contests</span>
        </h1>
        <p className="text-muted-foreground">
          View, edit, and manage contests
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Contests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by title or game name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Contests List */}
      <div className="space-y-4">
        {filteredContests.length > 0 ? (
          filteredContests.map((contest) => (
            <Card key={contest.id}>
              <CardContent className="p-6">
                {editingContest === contest.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${contest.id}`}>Title</Label>
                        <Input
                          id={`title-${contest.id}`}
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`game-${contest.id}`}>Game Name</Label>
                        <Input
                          id={`game-${contest.id}`}
                          value={editForm.game_name}
                          onChange={(e) => setEditForm({ ...editForm, game_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`type-${contest.id}`}>Game Type</Label>
                        <select
                          id={`type-${contest.id}`}
                          value={editForm.game_type}
                          onChange={(e) => setEditForm({ ...editForm, game_type: e.target.value })}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="Solo">Solo</option>
                          <option value="Duo">Duo</option>
                          <option value="Squad">Squad</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`fee-${contest.id}`}>Entry Fee</Label>
                        <Input
                          id={`fee-${contest.id}`}
                          type="number"
                          step="0.01"
                          value={editForm.entry_fee}
                          onChange={(e) => setEditForm({ ...editForm, entry_fee: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`prize-${contest.id}`}>Prize Pool</Label>
                        <Input
                          id={`prize-${contest.id}`}
                          type="number"
                          step="0.01"
                          value={editForm.prize_pool}
                          onChange={(e) => setEditForm({ ...editForm, prize_pool: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`slots-${contest.id}`}>Max Slots</Label>
                        <Input
                          id={`slots-${contest.id}`}
                          type="number"
                          value={editForm.max_slots}
                          onChange={(e) => setEditForm({ ...editForm, max_slots: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`time-${contest.id}`}>Match Time</Label>
                        <Input
                          id={`time-${contest.id}`}
                          type="datetime-local"
                          value={editForm.match_time}
                          onChange={(e) => setEditForm({ ...editForm, match_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`status-${contest.id}`}>Status</Label>
                        <select
                          id={`status-${contest.id}`}
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`info-${contest.id}`}>Contest Info</Label>
                      <Textarea
                        id={`info-${contest.id}`}
                        value={editForm.contest_info}
                        onChange={(e) => setEditForm({ ...editForm, contest_info: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => saveContest(contest.id)}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{contest.title}</h3>
                          <Badge variant={contest.status === 'open' ? 'default' : 'secondary'}>
                            {contest.status}
                          </Badge>
                          {contest.registration_locked && (
                            <Badge variant="destructive">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{contest.game_name} - {contest.game_type}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Entry: {contest.entry_fee}₹</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4" />
                            <span>Prize: {contest.prize_pool}₹</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{contest.current_slots}/{contest.max_slots} slots</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(contest.match_time).toLocaleString()}</span>
                          </span>
                        </div>
                        {contest.contest_info && (
                          <p className="text-sm text-muted-foreground">{contest.contest_info}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => joinContestAsAdmin(contest.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Join Contest
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (participants[contest.id]) {
                              setParticipants({ ...participants, [contest.id]: null });
                            } else {
                              fetchParticipants(contest.id);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {participants[contest.id] ? 'Hide' : 'View'} Participants
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(contest)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleContestLock(contest.id, contest.registration_locked)}
                        >
                          {contest.registration_locked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteContest(contest.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Participants List */}
                    {participants[contest.id] && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Participants ({participants[contest.id].length})</h4>
                        {participants[contest.id].length > 0 ? (
                          <div className="space-y-2">
                            {participants[contest.id].map((participant) => (
                              <div key={participant.user_id} className="flex items-center justify-between p-2 border border-border rounded">
                                <div>
                                  <span className="font-medium">{participant.username}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    Registered: {new Date(participant.registered_at).toLocaleString()}
                                  </span>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => kickParticipant(contest.id, participant.user_id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No participants yet</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No contests found matching your search.' : 'No contests found.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageContests;


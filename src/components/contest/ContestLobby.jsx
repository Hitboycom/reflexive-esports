import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomModal from '../ui/CustomModal';
import { useModal } from '../../hooks/useModal';
import { 
  Trophy, 
  Users, 
  DollarSign,
  Calendar,
  ArrowLeft,
  MessageCircle,
  UserCheck,
  Clock,
  GamepadIcon,
  Edit,
  Save,
  X
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ContestChat from './ContestChat';

const ContestLobby = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { token, API_BASE, user } = useAuth();
  const { modalState, hideModal, showAlert, showSuccess, showError } = useModal();
  const [contest, setContest] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    player1_name: '',
    player1_uid: '',
    player2_name: '',
    player2_uid: '',
    player3_name: '',
    player3_uid: '',
    player4_name: '',
    player4_uid: '',
    game_name: ''
  });

  useEffect(() => {
    fetchContestData();
  }, [contestId]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      
      // Fetch contest details
      const contestResponse = await fetch(`${API_BASE}/contests/${contestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (contestResponse.ok) {
        const contestData = await contestResponse.json();
        setContest(contestData);
      }

      // Fetch registrations
      const registrationsResponse = await fetch(`${API_BASE}/contests/${contestId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData.registrations || []);
      }

      // Check my registration
      const myRegistrationResponse = await fetch(`${API_BASE}/contests/${contestId}/registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (myRegistrationResponse.ok) {
        const myRegistrationData = await myRegistrationResponse.json();
        setMyRegistration(myRegistrationData.registration);
        
        // Initialize edit form with current registration data
        if (myRegistrationData.registration) {
          setEditForm({
            player1_name: myRegistrationData.registration.player1_name || '',
            player1_uid: myRegistrationData.registration.player1_uid || '',
            player2_name: myRegistrationData.registration.player2_name || '',
            player2_uid: myRegistrationData.registration.player2_uid || '',
            player3_name: myRegistrationData.registration.player3_name || '',
            player3_uid: myRegistrationData.registration.player3_uid || '',
            player4_name: myRegistrationData.registration.player4_name || '',
            player4_uid: myRegistrationData.registration.player4_uid || '',
            game_name: myRegistrationData.registration.game_name || ''
          });
        }
      }

    } catch (error) {
      console.error('Error fetching contest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEditRegistration = () => {
    if (!myRegistration) return false;
    
    const registrationTime = new Date(myRegistration.created_at);
    const now = new Date();
    const diffInMinutes = (now - registrationTime) / (1000 * 60);
    
    return diffInMinutes <= 5;
  };

  const handleEditRegistration = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (myRegistration) {
      setEditForm({
        player1_name: myRegistration.player1_name || '',
        player1_uid: myRegistration.player1_uid || '',
        player2_name: myRegistration.player2_name || '',
        player2_uid: myRegistration.player2_uid || '',
        player3_name: myRegistration.player3_name || '',
        player3_uid: myRegistration.player3_uid || '',
        player4_name: myRegistration.player4_name || '',
        player4_uid: myRegistration.player4_uid || '',
        game_name: myRegistration.game_name || ''
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/registration`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchContestData(); // Refresh data
        showSuccess('Registration updated successfully!');
      } else {
        const error = await response.json();
        showError(`Failed to update registration: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      showError('Failed to update registration');
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTeamMembers = (teamNumber) => {
    return registrations.filter(reg => reg.team_number === teamNumber);
  };

  const renderRegistrations = () => {
    // Filter out admin users completely from the participants list
    const filteredRegistrations = registrations.filter(registration => {
      // Filter out users with username 'admin' or any admin-related usernames
      if (registration.username && registration.username.toLowerCase().includes('admin')) {
        return false;
      }
      // Also filter by is_admin flag if available
      if (registration.is_admin === true) {
        return false;
      }
      // Filter out users with seat number 0 (non-participating users)
      if (registration.seat_number === 0) {
        return false;
      }
      return true;
    });

    if (contest.game_type === 'Solo') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegistrations.map((registration) => (
            <Card key={registration.id} className={registration.user_id === user.id ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    #{registration.seat_number}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{registration.username}</div>
                    <div className="text-sm text-muted-foreground">{registration.player1_name}</div>
                    <div className="text-xs text-muted-foreground">UID: {registration.player1_uid}</div>
                  </div>
                  {registration.user_id === user.id && (
                    <Badge variant="default">You</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // For Duo/Squad, group by teams but exclude non-participating admins
    const teams = {};
    filteredRegistrations.forEach(reg => {
      if (!teams[reg.team_number]) {
        teams[reg.team_number] = [];
      }
      teams[reg.team_number].push(reg);
    });

    return (
      <div className="space-y-6">
        {Object.entries(teams).map(([teamNumber, teamMembers]) => (
          <Card key={teamNumber} className={teamMembers.some(member => member.user_id === user.id) ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team {teamNumber}</span>
                {teamMembers.some(member => member.user_id === user.id) && (
                  <Badge variant="default">Your Team</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        #{member.seat_number}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{member.username}</div>
                        {member.user_id === user.id && (
                          <Badge variant="default" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Show all players for this team member */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {member.player1_name && (
                        <div>
                          <span className="font-medium">Player 1:</span> {member.player1_name}
                          <div className="text-xs text-muted-foreground">UID: {member.player1_uid}</div>
                        </div>
                      )}
                      {member.player2_name && (
                        <div>
                          <span className="font-medium">Player 2:</span> {member.player2_name}
                          <div className="text-xs text-muted-foreground">UID: {member.player2_uid}</div>
                        </div>
                      )}
                      {member.player3_name && (
                        <div>
                          <span className="font-medium">Player 3:</span> {member.player3_name}
                          <div className="text-xs text-muted-foreground">UID: {member.player3_uid}</div>
                        </div>
                      )}
                      {member.player4_name && (
                        <div>
                          <span className="font-medium">Player 4:</span> {member.player4_name}
                          <div className="text-xs text-muted-foreground">UID: {member.player4_uid}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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

  if (!myRegistration) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Registration Required</h1>
        <p className="text-muted-foreground mb-6">You need to register for this contest to access the lobby.</p>
        <Button onClick={() => navigate(`/contests/${contestId}/register`)}>
          Register for Contest
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
      
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
            {contest.game_name} - {contest.game_type} Contest Lobby
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
        </CardContent>
      </Card>

      {/* My Registration Info */}
      {myRegistration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Your Registration</span>
              </div>
              {canEditRegistration() && !isEditing && (
                <Button variant="outline" size="sm" onClick={handleEditRegistration}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
            {canEditRegistration() && (
              <CardDescription className="flex items-center space-x-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                <span>You can edit your registration for a few more minutes</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Game Name</label>
                    <Input
                      value={editForm.game_name}
                      onChange={(e) => handleFormChange('game_name', e.target.value)}
                      placeholder="Your in-game name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Player 1 Name</label>
                    <Input
                      value={editForm.player1_name}
                      onChange={(e) => handleFormChange('player1_name', e.target.value)}
                      placeholder="Player 1 name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Player 1 UID</label>
                    <Input
                      value={editForm.player1_uid}
                      onChange={(e) => handleFormChange('player1_uid', e.target.value)}
                      placeholder="Player 1 UID"
                    />
                  </div>
                  {contest?.game_type !== 'Solo' && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Player 2 Name</label>
                        <Input
                          value={editForm.player2_name}
                          onChange={(e) => handleFormChange('player2_name', e.target.value)}
                          placeholder="Player 2 name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Player 2 UID</label>
                        <Input
                          value={editForm.player2_uid}
                          onChange={(e) => handleFormChange('player2_uid', e.target.value)}
                          placeholder="Player 2 UID"
                        />
                      </div>
                    </>
                  )}
                  {contest?.game_type === 'Squad' && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Player 3 Name</label>
                        <Input
                          value={editForm.player3_name}
                          onChange={(e) => handleFormChange('player3_name', e.target.value)}
                          placeholder="Player 3 name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Player 3 UID</label>
                        <Input
                          value={editForm.player3_uid}
                          onChange={(e) => handleFormChange('player3_uid', e.target.value)}
                          placeholder="Player 3 UID"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Player 4 Name</label>
                        <Input
                          value={editForm.player4_name}
                          onChange={(e) => handleFormChange('player4_name', e.target.value)}
                          placeholder="Player 4 name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Player 4 UID</label>
                        <Input
                          value={editForm.player4_uid}
                          onChange={(e) => handleFormChange('player4_uid', e.target.value)}
                          placeholder="Player 4 UID"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Seat Number</div>
                  <div className="font-semibold">#{myRegistration.seat_number}</div>
                </div>
                {myRegistration.team_number && (
                  <div>
                    <div className="text-sm text-muted-foreground">Team</div>
                    <div className="font-semibold">Team {myRegistration.team_number}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Game Name</div>
                  <div className="font-semibold">{myRegistration.game_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Primary UID</div>
                  <div className="font-semibold">{myRegistration.game_uid_1}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for Participants and Chat */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Participants ({registrations.filter(registration => {
              // Filter out admin users from the count
              if (registration.username && registration.username.toLowerCase().includes('admin')) {
                return false;
              }
              if (registration.is_admin === true) {
                return false;
              }
              if (registration.seat_number === 0) {
                return false;
              }
              return true;
            }).length})</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GamepadIcon className="h-5 w-5" />
                <span>Contest Participants</span>
              </CardTitle>
              <CardDescription>
                All registered participants for this contest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No participants yet
                </div>
              ) : (
                renderRegistrations()
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat">
          <ContestChat contestId={contestId} contest={contest} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestLobby;


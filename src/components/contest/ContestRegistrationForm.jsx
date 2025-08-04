import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CustomModal from '../ui/CustomModal';
import { useModal } from '../../hooks/useModal';
import { 
  Trophy, 
  Users, 
  DollarSign,
  Calendar,
  GamepadIcon,
  Edit,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContestRegistrationForm = ({ contest, onRegistrationSuccess }) => {
  const { token, API_BASE, user } = useAuth();
  const { modalState, hideModal, showAlert, showSuccess, showError, showConfirm } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    player1_name: '',
    player1_uid: '',
    player2_name: '',
    player2_uid: '',
    player3_name: '',
    player3_uid: '',
    player4_name: '',
    player4_uid: ''
  });

  useEffect(() => {
    checkExistingRegistration();
  }, [contest.id]);

  const checkExistingRegistration = async () => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contest.id}/registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExistingRegistration(data.registration);
        setFormData({
          player1_name: data.registration.player1_name || '',
          player1_uid: data.registration.player1_uid || '',
          player2_name: data.registration.player2_name || '',
          player2_uid: data.registration.player2_uid || '',
          player3_name: data.registration.player3_name || '',
          player3_uid: data.registration.player3_uid || '',
          player4_name: data.registration.player4_name || '',
          player4_uid: data.registration.player4_uid || ''
        });
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.player1_name.trim()) {
      showError('Player 1 name is required');
      return false;
    }
    
    if (!formData.player1_uid.trim()) {
      showError('Player 1 UID is required');
      return false;
    }

    if (contest.game_type === 'Duo') {
      if (!formData.player2_name.trim() || !formData.player2_uid.trim()) {
        showError('Player 2 name and UID are required for Duo contests');
        return false;
      }
    }

    if (contest.game_type === 'Squad') {
      if (!formData.player2_name.trim() || !formData.player2_uid.trim() || 
          !formData.player3_name.trim() || !formData.player3_uid.trim() ||
          !formData.player4_name.trim() || !formData.player4_uid.trim()) {
        showError('All four players\' names and UIDs are required for Squad contests');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (user.wallet_balance < contest.entry_fee) {
      showError('Insufficient wallet balance. Please add funds to your wallet.');
      return;
    }

    // Show confirmation dialog
    const confirmMessage = `IMPORTANT WARNING:

Once you register for this contest, you CANNOT:
• Unregister from the contest
• Get a refund of your entry fee (₹${contest.entry_fee})
• Change your mind after registration

Your entry fee will be permanently deducted from your wallet.

Are you absolutely sure you want to proceed with registration?`;

    const confirmed = await showConfirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contests/${contest.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          confirmed: true // Add confirmation flag
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Successfully registered for contest!');
        setExistingRegistration(data.registration);
        onRegistrationSuccess && onRegistrationSuccess(data);
      } else {
        const error = await response.json();
        if (error.requires_confirmation) {
          // This shouldn't happen since we already confirmed, but handle it
          const retryConfirmed = await showConfirm(error.confirmation_message);
          if (retryConfirmed) {
            // Retry with confirmation
            handleRegister();
          }
        } else {
          showError(`Registration failed: ${error.error}`);
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
      showError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contests/${contest.id}/registration`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Registration updated successfully!');
        setExistingRegistration(data.registration);
        setEditMode(false);
      } else {
        const error = await response.json();
        showError(`Update failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      showError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    showAlert('Unregistration is not allowed. All contest registrations are final with no refunds.');
    return;
  };

  const goToLobby = () => {
    navigate(`/contests/${contest.id}/lobby`);
  };

  const getPlayerLabel = (playerNum, type) => {
    if (contest.game_type === 'Solo') {
      return type === 'name' ? 'Your Game Name' : 'Your Game UID';
    }
    return type === 'name' ? `Player ${playerNum} Name` : `Player ${playerNum} UID`;
  };

  const getPlayerPlaceholder = (playerNum, type) => {
    if (type === 'name') {
      return `Enter player ${playerNum}'s ${contest.game_name} name`;
    }
    return `Enter player ${playerNum}'s ${contest.game_name} UID`;
  };

  if (existingRegistration && !editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Registration Confirmed</span>
          </CardTitle>
          <CardDescription>
            You are registered for this contest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Seat Number</Label>
              <div className="p-2 bg-muted rounded-md">#{existingRegistration.seat_number}</div>
            </div>
            {existingRegistration.team_number && (
              <div>
                <Label>Team Number</Label>
                <div className="p-2 bg-muted rounded-md">Team {existingRegistration.team_number}</div>
              </div>
            )}
            <div>
              <Label>Player 1 Name</Label>
              <div className="p-2 bg-muted rounded-md">{existingRegistration.player1_name}</div>
            </div>
            <div>
              <Label>Player 1 UID</Label>
              <div className="p-2 bg-muted rounded-md">{existingRegistration.player1_uid}</div>
            </div>
            {contest.game_type !== 'Solo' && existingRegistration.player2_name && (
              <>
                <div>
                  <Label>Player 2 Name</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player2_name}</div>
                </div>
                <div>
                  <Label>Player 2 UID</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player2_uid}</div>
                </div>
              </>
            )}
            {contest.game_type === 'Squad' && existingRegistration.player3_name && (
              <>
                <div>
                  <Label>Player 3 Name</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player3_name}</div>
                </div>
                <div>
                  <Label>Player 3 UID</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player3_uid}</div>
                </div>
                <div>
                  <Label>Player 4 Name</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player4_name}</div>
                </div>
                <div>
                  <Label>Player 4 UID</Label>
                  <div className="p-2 bg-muted rounded-md">{existingRegistration.player4_uid}</div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={goToLobby} className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Join Contest Lobby
            </Button>
            {existingRegistration.can_edit && (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Contest registrations are final. No unregistration or refunds are allowed.
            </p>
          </div>
          
          {existingRegistration.can_edit && (
            <div className="text-sm text-muted-foreground flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>You can edit your registration for 5 minutes after joining</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
      
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GamepadIcon className="h-5 w-5" />
          <span>{existingRegistration ? 'Edit Registration' : 'Contest Registration'}</span>
        </CardTitle>
        <CardDescription>
          {existingRegistration ? 'Update your registration details' : 'Enter your game information to join this contest'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contest Info Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Prize Pool</span>
            </div>
            <div className="font-semibold">{contest.prize_pool}₹</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Entry Fee</span>
            </div>
            <div className="font-semibold">{contest.entry_fee}₹</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Slots</span>
            </div>
            <div className="font-semibold">{contest.current_slots}/{contest.max_slots}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <GamepadIcon className="h-4 w-4" />
              <span>Type</span>
            </div>
            <Badge variant="secondary">{contest.game_type}</Badge>
          </div>
        </div>

        {/* Registration Form */}
        <div className="space-y-4">
          {/* Player 1 (Always required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                {contest.game_type === 'Solo' ? 'Your Details' : 'Player 1 Details'}
              </h4>
            </div>
            <div>
              <Label htmlFor="player1_name">{getPlayerLabel(1, 'name')} *</Label>
              <Input
                id="player1_name"
                name="player1_name"
                value={formData.player1_name}
                onChange={handleInputChange}
                placeholder={getPlayerPlaceholder(1, 'name')}
                required
              />
            </div>
            <div>
              <Label htmlFor="player1_uid">{getPlayerLabel(1, 'uid')} *</Label>
              <Input
                id="player1_uid"
                name="player1_uid"
                value={formData.player1_uid}
                onChange={handleInputChange}
                placeholder={getPlayerPlaceholder(1, 'uid')}
                required
              />
            </div>
          </div>

          {/* Player 2 (For DUO and SQUAD) */}
          {contest.game_type !== 'Solo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="md:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Player 2 Details</h4>
              </div>
              <div>
                <Label htmlFor="player2_name">{getPlayerLabel(2, 'name')} *</Label>
                <Input
                  id="player2_name"
                  name="player2_name"
                  value={formData.player2_name}
                  onChange={handleInputChange}
                  placeholder={getPlayerPlaceholder(2, 'name')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="player2_uid">{getPlayerLabel(2, 'uid')} *</Label>
                <Input
                  id="player2_uid"
                  name="player2_uid"
                  value={formData.player2_uid}
                  onChange={handleInputChange}
                  placeholder={getPlayerPlaceholder(2, 'uid')}
                  required
                />
              </div>
            </div>
          )}

          {/* Player 3 and 4 (For SQUAD only) */}
          {contest.game_type === 'Squad' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Player 3 Details</h4>
                </div>
                <div>
                  <Label htmlFor="player3_name">{getPlayerLabel(3, 'name')} *</Label>
                  <Input
                    id="player3_name"
                    name="player3_name"
                    value={formData.player3_name}
                    onChange={handleInputChange}
                    placeholder={getPlayerPlaceholder(3, 'name')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="player3_uid">{getPlayerLabel(3, 'uid')} *</Label>
                  <Input
                    id="player3_uid"
                    name="player3_uid"
                    value={formData.player3_uid}
                    onChange={handleInputChange}
                    placeholder={getPlayerPlaceholder(3, 'uid')}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Player 4 Details</h4>
                </div>
                <div>
                  <Label htmlFor="player4_name">{getPlayerLabel(4, 'name')} *</Label>
                  <Input
                    id="player4_name"
                    name="player4_name"
                    value={formData.player4_name}
                    onChange={handleInputChange}
                    placeholder={getPlayerPlaceholder(4, 'name')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="player4_uid">{getPlayerLabel(4, 'uid')} *</Label>
                  <Input
                    id="player4_uid"
                    name="player4_uid"
                    value={formData.player4_uid}
                    onChange={handleInputChange}
                    placeholder={getPlayerPlaceholder(4, 'uid')}
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Wallet Balance Check */}
        {user && user.wallet_balance < contest.entry_fee && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Insufficient wallet balance. You need {contest.entry_fee}₹ but have {user.wallet_balance}₹.
              Please add funds to your wallet before registering.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {existingRegistration ? (
            <>
              <Button 
                onClick={handleUpdate} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Registration'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleRegister} 
              disabled={loading || user?.wallet_balance < contest.entry_fee}
              className="flex-1"
            >
              {loading ? 'Registering...' : `Register (${contest.entry_fee}₹)`}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          * Required fields. You can edit your registration for 5 minutes after joining.
          {contest.game_type === 'Solo' && <br />}
          {contest.game_type === 'Solo' && '• Solo: 1 player name + 1 UID required'}
          {contest.game_type === 'Duo' && <br />}
          {contest.game_type === 'Duo' && '• Duo: 2 player names + 2 UIDs required'}
          {contest.game_type === 'Squad' && <br />}
          {contest.game_type === 'Squad' && '• Squad: 4 player names + 4 UIDs required'}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default ContestRegistrationForm;


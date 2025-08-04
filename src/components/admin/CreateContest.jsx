import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  Users, 
  GamepadIcon,
  Info,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateContest = () => {
  const { token, API_BASE } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game_name: '',
    game_type: 'Solo',
    entry_fee: '',
    prize_pool: '',
    max_slots: '',
    match_time: '',
    contest_info: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = ['title', 'game_name', 'game_type', 'entry_fee', 'prize_pool', 'max_slots', 'match_time'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          alert(`Please fill in the ${field.replace('_', ' ')} field`);
          setLoading(false);
          return;
        }
      }

      // Format the match time for API
      let matchDateTime;
      try {
        if (!formData.match_time) {
          alert('Please select a match date and time');
          setLoading(false);
          return;
        }
        matchDateTime = new Date(formData.match_time).toISOString();
      } catch (error) {
        alert('Please enter a valid date and time');
        setLoading(false);
        return;
      }

      const contestData = {
        ...formData,
        entry_fee: parseFloat(formData.entry_fee),
        prize_pool: parseFloat(formData.prize_pool),
        max_slots: parseInt(formData.max_slots),
        match_time: matchDateTime
      };

      const response = await fetch(`${API_BASE}/admin/contests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contestData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Contest created successfully!');
        navigate('/admin/contests');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create contest'}`);
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Failed to create contest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const gameTypes = [
    { value: 'Solo', label: 'Solo (1 player)', maxSlots: 100 },
    { value: 'Duo', label: 'Duo (2 players per team)', maxSlots: 50 },
    { value: 'Squad', label: 'Squad (4 players per team)', maxSlots: 25 }
  ];

  const selectedGameType = gameTypes.find(type => type.value === formData.game_type);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Trophy className="h-8 w-8" />
            <span>Create Contest</span>
          </h1>
          <p className="text-muted-foreground">
            Set up a new gaming contest for players to join
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin</span>
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Contest title and game details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contest Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Free Fire Championship"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game_name">Game Name *</Label>
                <Input
                  id="game_name"
                  name="game_name"
                  value={formData.game_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Free Fire, PUBG Mobile, Call of Duty"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game_type">Game Type *</Label>
                <select
                  id="game_type"
                  name="game_type"
                  value={formData.game_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                >
                  {gameTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Maximum recommended slots for {formData.game_type}: {selectedGameType?.maxSlots}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contest_info">Contest Information</Label>
                <Textarea
                  id="contest_info"
                  name="contest_info"
                  value={formData.contest_info}
                  onChange={handleInputChange}
                  placeholder="Additional contest rules, instructions, or information..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contest Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GamepadIcon className="h-5 w-5" />
                <span>Contest Settings</span>
              </CardTitle>
              <CardDescription>
                Entry fee, prizes, and participant limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entry_fee" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Entry Fee (coins) *</span>
                </Label>
                <Input
                  id="entry_fee"
                  name="entry_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entry_fee}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize_pool" className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Prize Pool (coins) *</span>
                </Label>
                <Input
                  id="prize_pool"
                  name="prize_pool"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prize_pool}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_slots" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Maximum Slots *</span>
                </Label>
                <Input
                  id="max_slots"
                  name="max_slots"
                  type="number"
                  min="1"
                  max={selectedGameType?.maxSlots}
                  value={formData.max_slots}
                  onChange={handleInputChange}
                  placeholder={`e.g., ${selectedGameType?.maxSlots}`}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  For {formData.game_type}: {formData.game_type === 'Solo' ? 'individual players' : 
                  formData.game_type === 'Duo' ? 'teams of 2' : 'teams of 4'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="match_time" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Match Date & Time *</span>
                </Label>
                <Input
                  id="match_time"
                  name="match_time"
                  type="datetime-local"
                  value={formData.match_time}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Preview</CardTitle>
            <CardDescription>
              Review your contest details before creating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Entry Fee</p>
                <p className="text-lg font-bold">{formData.entry_fee || '0'}₹</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="text-lg font-bold">{formData.prize_pool || '0'}₹</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Max Participants</p>
                <p className="text-lg font-bold">{formData.max_slots || '0'} {formData.game_type === 'Solo' ? 'players' : 'teams'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link to="/admin">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Contest'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateContest;


import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomModal from '../ui/CustomModal';
import { useModal } from '../../hooks/useModal';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Trash2, 
  Edit,
  Crown,
  Shield,
  Clock
} from 'lucide-react';

const ContestChat = ({ contestId, contest }) => {
  const { token, API_BASE, user } = useAuth();
  const { modalState, hideModal, showAlert, showConfirm, showError } = useModal();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchParticipants();
    
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(interval);
  }, [contestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/messages?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch(`${API_BASE}/contests/${contestId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        showError(`Failed to send message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendAdminAnnouncement = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch(`${API_BASE}/contests/${contestId}/messages/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        showError(`Failed to send announcement: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      showError('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmed = await showConfirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        showError(`Failed to delete message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Failed to delete message');
    }
  };

  const startEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message.replace('📢 ANNOUNCEMENT: ', ''));
  };

  const saveEditMessage = async (messageId) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/contests/${contestId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: editText.trim() }),
      });

      if (response.ok) {
        setEditingMessage(null);
        setEditText('');
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        showError(`Failed to edit message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error editing message:', error);
      showError('Failed to edit message');
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canEditOrDelete = (message) => {
    if (user.is_admin) return true;
    if (message.user_id !== user.id) return false;
    
    // Check if message is within 5 minutes
    const messageTime = new Date(message.created_at);
    const now = new Date();
    const diffInMinutes = (now - messageTime) / (1000 * 60);
    
    return diffInMinutes <= 5;
  };

  const getMessageTime = (createdAt) => {
    const messageTime = new Date(createdAt);
    return messageTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
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
      
      {/* Chat Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Contest Chat</span>
            <Badge variant="secondary">{participants.length} participants</Badge>
          </CardTitle>
          <CardDescription>
            Chat with other participants in this contest
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-3 bg-muted/20"
          >
            {loading ? (
              <div className="text-center text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages yet. Be the first to say something!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className={`flex items-start space-x-3 ${
                    message.user_id === user.id ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        message.is_admin ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                      }`}>
                        {message.is_admin ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          message.username?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex-1 max-w-xs md:max-w-md ${
                      message.user_id === user.id ? 'text-right' : ''
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.username}
                          {message.is_admin && (
                            <Crown className="h-3 w-3 inline ml-1 text-yellow-500" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getMessageTime(message.created_at)}
                        </span>
                      </div>
                      
                      {editingMessage === message.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => saveEditMessage(message.id)}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg text-sm ${
                          message.is_admin_message 
                            ? 'bg-red-100 border border-red-200 text-red-800' 
                            : message.user_id === user.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border'
                        }`}>
                          {message.message}
                        </div>
                      )}
                      
                      {canEditOrDelete(message) && editingMessage !== message.id && (
                        <div className="flex space-x-1 mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditMessage(message)}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMessage(message.id)}
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={sending || !newMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
              {user.is_admin && (
                <Button 
                  onClick={sendAdminAnnouncement} 
                  disabled={sending || !newMessage.trim()}
                  variant="destructive"
                  size="sm"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>You can edit/delete messages for 5 minutes after sending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContestChat;


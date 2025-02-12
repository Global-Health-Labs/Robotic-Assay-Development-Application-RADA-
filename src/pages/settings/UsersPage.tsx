import axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Edit2, Search, Send, UserCheck, UserX, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddUserDialog } from './components/AddUserDialog';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  role_updated_at: string;
  status: 'active' | 'disabled';
  confirmed: boolean;
}

type EditState = {
  id: string;
  fullname: string;
  role: string;
};

export default function UsersPage() {
  const { role: currentUserRole, id: currentUserId } = useAuth();
  const queryClient = useQueryClient();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get<User[]>('/users');
      return response.data;
    },
  });

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.fullname.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await axios.put(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditState(null);
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'disabled' }) => {
      const response = await axios.put(`/users/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/users/${id}/resend-invitation`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });

  const handleEdit = (user: User) => {
    if (editState?.id === user.id) {
      setEditState(null);
    } else {
      setEditState({
        id: user.id,
        fullname: user.fullname,
        role: user.role,
      });
    }
  };

  const handleSave = (user: User) => {
    if (!editState) return;

    const { fullname, role } = editState;

    if (!fullname.trim()) {
      toast.error('Name is required');
      return;
    }

    updateMutation.mutate({
      id: user.id,
      data: { fullname, role },
    });
  };

  const handleCancel = () => {
    setEditState(null);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    toggleStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleResendInvitation = (userId: string) => {
    resendInvitationMutation.mutate(userId);
  };

  if (currentUserRole !== 'admin') {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground">
          You don't have permission to access this page
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="mb-4 text-sm text-muted-foreground">Manage user accounts and roles</p>
        </div>

        <AddUserDialog />
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-16"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchQuery('');
            }
          }}
        />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editState?.id === user.id ? (
                    <Input
                      value={editState.fullname}
                      onChange={(e) =>
                        setEditState((prev) =>
                          prev ? { ...prev, fullname: e.target.value } : null
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCancel();
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{user.fullname}</span>
                      {user.status === 'disabled' && (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                          Disabled
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {editState?.id === user.id && currentUserId !== user.id ? (
                    <Select
                      value={editState.role}
                      onValueChange={(value) =>
                        setEditState((prev) => (prev ? { ...prev, role: value } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>{dayjs(user.role_updated_at).format('DD MMM YYYY, HH:mm')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editState?.id === user.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleSave(user)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {currentUserId !== user.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                user.status === 'active' ? 'text-destructive' : 'text-primary'
                              )}
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'active' ? 'Disable user' : 'Enable user'}
                            >
                              {user.status === 'active' ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            {user.status === 'active' && !user.confirmed && (
                              <Button
                                variant="ghost"
                                onClick={() => handleResendInvitation(user.id)}
                                className="text-primary"
                                title="Resend invitation"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

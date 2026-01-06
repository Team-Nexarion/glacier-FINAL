import { useState, useEffect } from 'react';
import { Mountain, LayoutDashboard, Upload, Bell, UserPlus, LogOut, User, Mail, Building, Briefcase, Check, X, Lock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAuthClick?: () => void;
  onLogout?: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  photo: string | null;
}

const TopNavbar = ({ activeTab, onTabChange, onAuthClick, onLogout }: TopNavbarProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [updatePasswordOpen, setUpdatePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    // Check for logged in user
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleLogout = async () => {
    try {
      await fetch('https://glacier-backend-1.onrender.com/official/signout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error signing out');
    }
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    if (onLogout) onLogout();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      const res = await fetch('https://glacier-backend-1.onrender.com/official/updatepassword', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Password updated successfully');
        setUpdatePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating password');
    }
    setUpdatingPassword(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#111827] border-b border-border">

      <div className="flex items-center justify-between px-6 h-14">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <Mountain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              GLOF Intelligence
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              Glacier Lake Monitoring
            </p>
          </div>
        </div>

        {/* Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={`
                  gap-2 h-9 px-4 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Right Side - User Section */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            // User is logged in - show dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-all duration-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.photo || undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:block">
                    {currentUser.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0 bg-[#1a1f2e] border-gray-700">
                {/* User Profile Header */}
                <div className="flex flex-col items-center p-4 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-gray-700">
                  <Avatar className="h-16 w-16 mb-3 border-2 border-blue-500">
                    <AvatarImage src={currentUser.photo || undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-white text-base">{currentUser.name}</h3>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>

                {/* User Details */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300 px-2 py-1">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">{currentUser.position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300 px-2 py-1">
                    <Building className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">{currentUser.department}</span>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-700" />

                {/* Actions */}
                <div className="p-2">
                  <DropdownMenuItem
                    onClick={() => setUpdatePasswordOpen(true)}
                    className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md cursor-pointer px-3 py-2"
                  >
                    <Key className="h-4 w-4" />
                    Update Password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md cursor-pointer px-3 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User not logged in - show register button
            <Button
              variant="outline"
              size="sm"
              onClick={onAuthClick}
              className="gap-2 bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Register as Official
            </Button>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/50">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>

    {/* Update Password Dialog */}
    <Dialog open={updatePasswordOpen} onOpenChange={setUpdatePasswordOpen}>
      <DialogContent className="sm:max-w-[400px] bg-[#111827] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Update Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-slate-300">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={updatingPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default TopNavbar;


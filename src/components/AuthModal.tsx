import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, User, Mail, Lock, Building, Camera, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('official@glacier.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPosition, setSignupPosition] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
  const [signupPhoto, setSignupPhoto] = useState<File | null>(null);

  // Reset to login tab when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('login');
    }
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('https://glacier-backend-4r0g.onrender.com/official/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        onOpenChange(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error logging in');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('email', signupEmail);
    formData.append('name', signupName);
    formData.append('position', signupPosition);
    formData.append('department', signupDepartment);
    if (signupPhoto) {
      formData.append('photo', signupPhoto);
    }
    
    try {
      const res = await fetch('https://glacier-backend-4r0g.onrender.com/official/register', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        onOpenChange(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error registering');
    }
    
    setLoading(false);
    
    // Reset form
    setSignupName('');
    setSignupEmail('');
    setSignupPosition('');
    setSignupDepartment('');
    setSignupPhoto(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignupPhoto(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px] p-0 bg-[#111827] border-gray-700 overflow-hidden">

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none z-10"
        >
          <X className="h-4 w-4 text-gray-400" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-1">
            GLOF Intelligence
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in or create an account
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-slate-800 p-0 h-12 rounded-none border-b border-gray-700">
            <TabsTrigger 
              value="login" 
              className="rounded-none h-12 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 border-b-2 border-transparent data-[state=active]:border-blue-500 transition-all"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="rounded-none h-12 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 border-b-2 border-transparent data-[state=active]:border-blue-500 transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="p-6 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="login-email"
                    type="email"
                   
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="p-4 mt-0">

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Profile Photo - At Top */}
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Profile Photo</Label>
                <div className="flex items-center gap-3 py-1">
                  <div className="relative">
                    {signupPhoto ? (
                      <img
                        src={URL.createObjectURL(signupPhoto)}
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                        <Camera className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <label
                      htmlFor="signup-photo"
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="h-2.5 w-2.5 text-white" />
                    </label>
                  </div>
                  <Input
                    id="signup-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-xs text-slate-400">
                    {signupPhoto ? 'Photo selected' : 'Click to upload'}
                  </span>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder=""
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder=""
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-position" className="text-slate-300">Position</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="signup-position"
                      type="text"
                      placeholder=""
                      value={signupPosition}
                      onChange={(e) => setSignupPosition(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-department" className="text-slate-300">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="signup-department"
                      type="text"
                      placeholder=""
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? 'Creating Account...' : 'Register as Official'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;


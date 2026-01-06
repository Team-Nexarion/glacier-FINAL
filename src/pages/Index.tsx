import { useState, useEffect } from 'react';
import TopNavbar from '@/components/TopNavbar';
import FilterSidebar from '@/components/FilterSidebar';
import MapView from '@/components/MapView';

import LakeDetailPanel from '@/components/LakeDetailPanel';
import { GlacierLake } from '@/data/lakesData';
import { LakeData } from '@/components/MapView';
import UploadDataPage from "@/components/UploadDataPage"
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Check, X, MapPin, User, AlertTriangle, BarChart2, Loader2 } from 'lucide-react';
import RiskTag from '@/components/RiskTag';

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  photo: string | null;
}

interface LakeReport {
  id: number;
  lakeName: string;
  latitude: number;
  longitude: number;
  region: string;
  uploadedById: number;
  uploadedAt: string;
  Lake_Area_km2: number;
  Dam_Slope_deg: number;
  Lake_Temp_C: number;
  Elevation_m: number;
  observationDate: string;
  riskLevel: string;
  confidence: number;
  assessedAt: string;
  verificationStatus: string;
  verifiedById: number | null;
  verifiedAt: string | null;
  declineById: number | null;
  declinedAt: string | null;
  createdAt: string;
  uploadedBy: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    photo: string | null;
  };
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    photo: string | null;
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(null);
  const [lakes, setLakes] = useState<LakeData[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<LakeReport[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingLakes, setLoadingLakes] = useState(false);
  const [loadingLakeDetails, setLoadingLakeDetails] = useState(false);
  const [filters, setFilters] = useState({
    riskLevels: ['HIGH', 'MEDIUM', 'LOW'],
    yearRange: [2018, 2024] as [number, number],
    searchQuery: '',
  });

  // Check for logged in user on mount
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch lakes data on mount
  useEffect(() => {
    fetchLakes();
  }, []);

  const fetchLakes = async () => {
    setLoadingLakes(true);
    try {
      const res = await fetch('https://glacier-backend-1.onrender.com/lakereport', {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (data.success) {
        setLakes(data.data);
        console.log('Lakes loaded:', data.data.length);
      } else {
        console.error('Failed to fetch lakes:', data.message);
      }
    } catch (err) {
      console.error('Error fetching lakes:', err);
    }
    setLoadingLakes(false);
  };

  // Fetch notifications when tab changes to notifications
  useEffect(() => {
    if (activeTab === 'notifications' && currentUser) {
      fetchNotifications();
    }
  }, [activeTab, currentUser]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetch('https://glacier-backend-1.onrender.com/lakereport/pending/high-risk', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
    setLoadingNotifications(false);
  };

  const handleVerify = async (id: number) => {
    try {
      const res = await fetch(`https://glacier-backend-1.onrender.com/lakereport/verify/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // Update the notification status
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, verificationStatus: 'VERIFIED', verifiedById: currentUser?.id || null, verifiedAt: new Date().toISOString() } : n
        ));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error verifying report');
    }
  };

  const handleDecline = async (id: number) => {
    try {
      const res = await fetch(`https://glacier-backend-1.onrender.com/lakereport/reject/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // Update the notification status
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, verificationStatus: 'REJECTED', declineById: currentUser?.id || null, declinedAt: new Date().toISOString() } : n
        ));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error declining report');
    }
  };

  // Update user state when auth modal closes (after login/register)
  const handleAuthClose = (open: boolean) => {
    setAuthModalOpen(open);
    if (!open) {
      // Check if user is now logged in
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleLakeSelect = async (lake: LakeData) => {
    console.log('========== LAKE CLICKED ==========');
    console.log('Lake clicked:', lake);
    
    setLoadingLakeDetails(true);
    setSelectedLake(lake);

    try {
      const res = await fetch(`https://glacier-backend-1.onrender.com/lakereport/details/${lake.id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (data.success && data.data) {
        console.log('========== LAKE DETAILS ==========');
        console.log('ID:', data.data.id);
        console.log('Name:', data.data.lakeName);
        console.log('Region:', data.data.region);
        console.log('Latitude:', data.data.latitude);
        console.log('Longitude:', data.data.longitude);
        console.log('Risk Level:', data.data.riskLevel);
        console.log('Confidence:', data.data.confidence);
        console.log('Lake Area:', data.data.Lake_Area_km2, 'km²');
        console.log('Elevation:', data.data.Elevation_m, 'm');
        console.log('Dam Slope:', data.data.Dam_Slope_deg, '°');
        console.log('Temperature:', data.data.Lake_Temp_C, '°C');
        console.log('Verification Status:', data.data.verificationStatus);
        console.log('Uploaded By:', data.data.uploadedBy);
        console.log('Verified By:', data.data.verifiedBy);
        console.log('==================================');
        setSelectedLake(data.data);
      } else {
        console.error('Failed to fetch lake details:', data.message);
      }
    } catch (err) {
      console.error('Error fetching lake details:', err);
    }
    setLoadingLakeDetails(false);
  };

  const handleClosePanel = () => {
    setSelectedLake(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onAuthClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={handleAuthClose} />

      {/* Main Content */}
      <main className="pt-16 h-screen">
  {activeTab === "dashboard" && (
    <div className="relative h-full">
      {/* Filter Sidebar */}
      <FilterSidebar filters={filters} onFiltersChange={setFilters} />

      {/* Map View */}
      <div className="h-full ml-64 transition-all duration-300">
        <MapView
          filters={filters}
          onLakeSelect={handleLakeSelect}
          selectedLake={selectedLake}
          lakes={lakes}
          isLoading={loadingLakes}
        />
      </div>

     

      {/* Lake Detail Panel */}
      <LakeDetailPanel lake={selectedLake} onClose={handleClosePanel} isLoading={loadingLakeDetails} />

      {/* Mobile overlay */}
      {selectedLake && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          onClick={handleClosePanel}
        />
      )}
    </div>
  )}

  {activeTab === "upload" && (
    <UploadDataPage />
  )}

  {activeTab === "insights" && (
    <div className="flex items-center justify-center h-full">
      <div className="glass-panel p-8 text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">Model Insights</h2>
        <p className="text-muted-foreground">
          This section is coming soon.
        </p>
      </div>
    </div>
  )}

  {activeTab === "notifications" && (
    <div className="flex items-center justify-center h-full p-6">
      <div className="glass-panel p-8 w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-6">Lake Notifications</h2>
        
        {loadingNotifications ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted-foreground">No pending notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((report) => (
              <div key={report.id} className="border border-border rounded-xl p-6 bg-card/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{report.lakeName}</h3>
                    <p className="text-sm text-muted-foreground">ID: {report.id}</p>
                  </div>
                  <RiskTag level={report.riskLevel.toLowerCase() as 'high' | 'medium' | 'low'} score={report.confidence / 100} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-mono">{report.latitude}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-mono">{report.longitude}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Region:</span>
                    <span>{report.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Uploaded By:</span>
                    <span>{report.uploadedBy.name} ({report.uploadedBy.department})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className={`font-medium ${report.riskLevel === 'HIGH' ? 'text-red-400' : report.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{report.riskLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-mono">{report.confidence}%</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Uploaded: {new Date(report.uploadedAt).toLocaleString()}</p>
                  <p>Assessed: {new Date(report.assessedAt).toLocaleString()}</p>
                </div>
                
                {report.verificationStatus === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleVerify(report.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleDecline(report.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}
                
                {report.verificationStatus !== 'PENDING' && (
                  <div className="pt-4 border-t border-border">
                    <p className={`text-sm font-medium ${report.verificationStatus === 'VERIFIED' ? 'text-green-400' : 'text-red-400'}`}>
                      {report.verificationStatus === 'VERIFIED' ? 'Verified' : 'Declined'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <p className="text-center text-muted-foreground text-sm mt-6">
          Review and verify or decline lake risk assessments
        </p>
      </div>
    </div>
  )}
</main>

    </div>
  );
};

export default Index;

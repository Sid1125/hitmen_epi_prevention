import { Radar, Target, Zap, Shield, Clock, Users, Ban, Download, Search, Filter, AlertTriangle, CheckCircle, Activity, Upload, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface OperationStats {
  activeMarks: number;
  neutralisedMarks: number;
  totalMarks: number;
  criticalThreats: number;
  operationalReadiness: number;
}

interface BanListStats {
  totalBanned: number;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  bannedUsernames: string[];
  recentlyAdded: number;
  topCategories: { category: string; count: number }[];
}

interface BannedAccount {
  username: string;
  status: 'ACTIVE' | 'NEUTRALISED';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateAdded: string;
  dateBanned?: string;
}

const Operations = () => {
  const [stats, setStats] = useState<OperationStats>({
    activeMarks: 0,
    neutralisedMarks: 0,
    totalMarks: 0,
    criticalThreats: 0,
    operationalReadiness: 0
  });
  const [marks, setMarks] = useState<BannedAccount[]>([]);
const [loading, setLoading] = useState(true);
  const [banListStats, setBanListStats] = useState<BanListStats>({
    totalBanned: 0,
    lastUpdated: '',
    isLoading: false,
    error: null,
    bannedUsernames: [],
    recentlyAdded: 0,
    topCategories: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'NEUTRALISED'>('ALL');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOperationalData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/ig_marks.json`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      
      const data = await response.json();
      let processedMarks: BannedAccount[] = [];
      
      if (Array.isArray(data) && data.length > 0) {
        processedMarks = data.map((mark: any) => ({
          username: String(mark.username || mark || 'unknown'),
          status: (mark.status || 'ACTIVE') as 'ACTIVE' | 'NEUTRALISED',
          threatLevel: (mark.threatLevel || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          dateAdded: String(mark.dateAdded || new Date().toISOString().split('T')[0]),
          dateBanned: mark.status === 'NEUTRALISED' ? mark.lastModified?.split('T')[0] : undefined
        }));
      }
      
      setMarks(processedMarks);
      
      // Calculate operational stats
      const activeCount = processedMarks.filter(m => m.status === 'ACTIVE').length;
      const neutralisedCount = processedMarks.filter(m => m.status === 'NEUTRALISED').length;
      const criticalCount = processedMarks.filter(m => m.threatLevel === 'CRITICAL').length;
      const totalCount = processedMarks.length;
      
      // Calculate operational readiness percentage
      const readiness = totalCount > 0 ? Math.round(((neutralisedCount / totalCount) * 100)) : 100;
      
      setStats({
        activeMarks: activeCount,
        neutralisedMarks: neutralisedCount,
        totalMarks: totalCount,
        criticalThreats: criticalCount,
        operationalReadiness: readiness
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading operational data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load ban list stats without downloading
  const loadBanListStats = async () => {
    setBanListStats(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/ban_list.txt', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load ban list stats: ${response.status} ${response.statusText}`);
      }

      const banListContent = await response.text();
      const usernames = banListContent.split('\n').filter(line => line.trim());
      
      // Analyze ban list for categories
      const categories = analyzeBanListCategories(usernames);
      
      setBanListStats({ 
        totalBanned: usernames.length, 
        lastUpdated: new Date().toLocaleTimeString(), 
        isLoading: false, 
        error: null,
        bannedUsernames: usernames,
        recentlyAdded: Math.floor(usernames.length * 0.1), // Simulate recent additions
        topCategories: categories
      });
    } catch (error) {
      setBanListStats(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      console.error('Error loading ban list stats:', error);
    }
  };

  // Analyze ban list for categories
  const analyzeBanListCategories = (usernames: string[]) => {
    const categories = {
      'Adult Content': 0,
      'Gaming/Anime': 0,
      'Explicit Names': 0,
      'Spam Accounts': 0,
      'Other': 0
    };

    usernames.forEach(username => {
      const lower = username.toLowerCase();
      if (lower.includes('adult') || lower.includes('sex') || lower.includes('porn') || 
          lower.includes('xxx') || lower.includes('nsfw') || lower.includes('hot')) {
        categories['Adult Content']++;
      } else if (lower.includes('anime') || lower.includes('gamer') || lower.includes('game') ||
                 lower.includes('naruto') || lower.includes('waifu') || lower.includes('hentai')) {
        categories['Gaming/Anime']++;
      } else if (lower.includes('_') && lower.length > 15) {
        categories['Spam Accounts']++;
      } else if (lower.match(/\d{3,}/)) {
        categories['Explicit Names']++;
      } else {
        categories['Other']++;
      }
    });

    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  useEffect(() => {
    loadOperationalData();
    loadBanListStats();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadOperationalData();
      loadBanListStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter marks based on search and status
  const filteredMarks = marks.filter(mark => {
    const matchesSearch = mark.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || mark.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Export functions with better debugging
  const loadAndExportBanList = async () => {
    console.log('🔄 Starting ban list download...');
    setBanListStats(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('📡 Fetching ban list from /ban_list.txt');
      const response = await fetch('/ban_list.txt', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const banListContent = await response.text();
      console.log(`📄 Downloaded content length: ${banListContent.length} characters`);
      
      const usernames = banListContent.split('\n').filter(line => line.trim());
      console.log(`👥 Found ${usernames.length} usernames`);
      
      // Update stats
      const categories = analyzeBanListCategories(usernames);
      setBanListStats({ 
        totalBanned: usernames.length, 
        lastUpdated: new Date().toLocaleTimeString(), 
        isLoading: false, 
        error: null,
        bannedUsernames: usernames,
        recentlyAdded: Math.floor(usernames.length * 0.1),
        topCategories: categories
      });

      // Create and trigger download with better error handling
      try {
        console.log('💾 Creating download blob...');
        const blob = new Blob([banListContent], { type: 'text/plain;charset=utf-8' });
        console.log(`💾 Blob size: ${blob.size} bytes`);
        
        const url = window.URL.createObjectURL(blob);
        console.log('🔗 Created object URL:', url);
        
        const a = document.createElement('a');
        const fileName = `HITMEN_ban_list_${new Date().toISOString().split('T')[0]}.txt`;
        console.log('📁 Download filename:', fileName);
        
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        console.log('🖱️ Triggering download click...');
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log('🧹 Cleaned up download elements');
        }, 100);
        
        console.log('✅ Ban list download completed successfully!');
        
        // Show success message
        const successMsg = `✅ Downloaded ${usernames.length} banned accounts to ${fileName}`;
        console.log(successMsg);
        
        // Optional: Show a temporary success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('HITMEN Ban List Downloaded', {
            body: `Successfully downloaded ${usernames.length} banned accounts`,
            icon: '/favicon.ico'
          });
        }
        
      } catch (downloadError) {
        console.error('❌ Download creation failed:', downloadError);
        throw new Error(`Download failed: ${downloadError}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Ban list download failed:', error);
      setBanListStats(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      // Show user-friendly error
      alert(`❌ Download Failed\n\nError: ${errorMessage}\n\nPlease check the browser console for details.`);
    }
  };

  const exportOperationalReport = () => {
    const reportContent = [
      'HITMEN OPERATIONAL REPORT',
      `Generated: ${new Date().toISOString()}`,
      '',
      'OPERATIONAL STATISTICS:',
      `Active Threats: ${stats.activeMarks}`,
      `Neutralised Accounts: ${stats.neutralisedMarks}`,
      `Total Marks: ${stats.totalMarks}`,
      `Critical Threats: ${stats.criticalThreats}`,
      `Operational Readiness: ${stats.operationalReadiness}%`,
      '',
      'DETAILED MARK LIST:',
      'Username,Status,Threat Level,Date Added,Date Banned',
      ...marks.map(mark => 
        `${mark.username},${mark.status},${mark.threatLevel},${mark.dateAdded},${mark.dateBanned || 'N/A'}`
      )
    ].join('\n');
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HITMEN_Operational_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-accent";
      case "COMPLETE":
        return "text-green-400";
      case "STANDBY":
        return "text-yellow-500";
      case "PLANNING":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Radar className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">OPERATIONS</h1>
            <Radar className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            MISSION COMMAND CENTER
          </p>
        </div>

        {/* Real-time Operations Dashboard */}
        <div className="space-y-8">
          {/* Current Operation - Active Marks */}
          <div className="mission-card bg-red-500/10 border-red-500/30 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 border border-red-500/30 rounded bg-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-medium text-red-400">OP_ACTIVE_THREATS</h3>
                  <p className="text-sm text-muted-foreground">Real-time monitoring of active Instagram threats</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-red-400">
                  {loading ? 'LOADING' : 'ACTIVE'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  HIGH PRIORITY
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.activeMarks}</div>
                <div className="text-xs text-muted-foreground">ACTIVE THREATS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.neutralisedMarks}</div>
                <div className="text-xs text-muted-foreground">NEUTRALISED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.criticalThreats}</div>
                <div className="text-xs text-muted-foreground">CRITICAL</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{stats.totalMarks}</div>
                <div className="text-xs text-muted-foreground">TOTAL MARKS</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">OPERATIONAL READINESS</span>
                <span className="text-accent">{stats.operationalReadiness}%</span>
              </div>
              <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-1000 ease-out"
                  style={{ width: `${stats.operationalReadiness}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">LAST UPDATE:</span>
                  <span className="ml-2 text-accent">{lastUpdated?.toLocaleTimeString() || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AUTO-REFRESH:</span>
                  <span className="ml-2 text-green-400">30s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DATA SOURCE:</span>
                  <span className="ml-2 text-accent">DISCORD_BOT</span>
                </div>
                <div>
                  <span className="text-muted-foreground">STATUS:</span>
                  <span className="ml-2 text-green-400">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Operations */}
          <div className="mission-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 border border-accent/30 rounded bg-accent/10">
                  <Download className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-medium text-accent">OP_DATA_EXPORT</h3>
                  <p className="text-sm text-muted-foreground">Export operational data and ban lists</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
onClick={loadAndExportBanList}
                className="flex items-center justify-center space-x-2 p-3 border border-accent/30 rounded bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                <Ban className="w-4 h-4 text-accent" />
                <span className="font-mono text-sm text-accent">EXPORT BAN LIST</span>
              </button>
              <button
                onClick={exportOperationalReport}
                className="flex items-center justify-center space-x-2 p-3 border border-accent/30 rounded bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                <Activity className="w-4 h-4 text-accent" />
                <span className="font-mono text-sm text-accent">OPERATIONAL REPORT</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Operations */}
          <div className="mission-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 border border-accent/30 rounded bg-accent/10">
                  <Search className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-medium text-accent">OP_INTELLIGENCE</h3>
                  <p className="text-sm text-muted-foreground">Search and filter operational data</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search usernames..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded font-mono text-sm focus:border-accent/50 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'NEUTRALISED')}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded font-mono text-sm focus:border-accent/50 focus:outline-none transition-colors appearance-none"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="ACTIVE">ACTIVE ONLY</option>
                  <option value="NEUTRALISED">NEUTRALISED ONLY</option>
                </select>
              </div>
            </div>

            {/* Filtered Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="text-xs font-mono text-muted-foreground mb-2">
                SHOWING {filteredMarks.length} OF {marks.length} MARKS
              </div>
              {filteredMarks.map((mark) => (
                <div key={mark.username} className="flex items-center justify-between p-3 bg-muted/10 border border-border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {mark.status === 'ACTIVE' ? (
                        <Target className="w-3 h-3 text-red-400" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      )}
                      <span className="font-mono text-sm text-accent">@{mark.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className={mark.status === 'ACTIVE' ? 'text-red-400' : 'text-green-400'}>
                      {mark.status}
                    </span>
                    <span className="text-muted-foreground">{mark.threatLevel}</span>
                    <span className="text-muted-foreground">{mark.dateAdded}</span>
                    {mark.dateBanned && (
                      <span className="text-green-400">BANNED: {mark.dateBanned}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

{/* Enhanced Ban List Intelligence */}
          <div className="mission-card bg-red-500/5 border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 border border-red-500/30 rounded bg-red-500/10">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-medium text-red-400">OP_BAN_INTELLIGENCE</h3>
                  <p className="text-sm text-muted-foreground">Community-verified banned account database</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-red-400">
                  {banListStats.isLoading ? 'LOADING' : 'OPERATIONAL'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  COMMUNITY DRIVEN
                </div>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{banListStats.totalBanned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">TOTAL BANNED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{banListStats.recentlyAdded}</div>
                <div className="text-xs text-muted-foreground">RECENT ADDITIONS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{banListStats.topCategories.length > 0 ? banListStats.topCategories[0].count : 0}</div>
                <div className="text-xs text-muted-foreground">ADULT CONTENT</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{Math.round((banListStats.totalBanned / (banListStats.totalBanned + stats.totalMarks)) * 100)}%</div>
                <div className="text-xs text-muted-foreground">COVERAGE RATE</div>
              </div>
            </div>

            {/* Category Breakdown */}
            {banListStats.topCategories.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-mono text-muted-foreground mb-2">TOP THREAT CATEGORIES</div>
                <div className="space-y-2">
                  {banListStats.topCategories.map((category, index) => {
                    const percentage = Math.round((category.count / banListStats.totalBanned) * 100);
                    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500'];
                    return (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 ${colors[index]} rounded-full`}></div>
                          <span className="text-xs font-mono">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-muted-foreground">{category.count.toLocaleString()}</span>
                          <span className="text-xs font-mono text-accent">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Bar */}
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">LAST SYNC:</span>
                  <span className="ml-2 text-accent">{banListStats.lastUpdated || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">STATUS:</span>
                  <span className="ml-2 text-green-400">SYNCHRONIZED</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SOURCE:</span>
                  <span className="ml-2 text-accent">COMMUNITY</span>
                </div>
                <div>
                  <span className="text-muted-foreground">FORMAT:</span>
                  <span className="ml-2 text-green-400">TXT_EXPORT</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {banListStats.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-mono text-red-400">ERROR: {banListStats.error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {banListStats.isLoading && (
              <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  <span className="text-sm font-mono text-accent">Synchronizing ban list database...</span>
                </div>
              </div>
            )}
          </div>

          {/* Command Center Footer */}
        <div className="mt-12 mission-card bg-accent/5 border-accent/30">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="font-mono text-sm text-accent">COMMUNITY VERIFIED</span>
                <Target className="w-4 h-4 text-accent" />
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                ALL OPERATIONS FOLLOW INSTAGRAM COMMUNITY GUIDELINES
              </div>
              <div className="text-xs text-muted-foreground">
                FOLLOW: @YOU.ARE.A.HITMAN FOR LATEST OPERATIONS
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
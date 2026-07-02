import { Shield, Target, AlertTriangle, CheckCircle, Instagram, ExternalLink, RefreshCw, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface InstagramMark {
  username: string;
  status: 'ACTIVE' | 'NEUTRALISED';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateAdded: string;
}

const MarksGallery = () => {
  const [marks, setMarks] = useState<InstagramMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const threatLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
  const statuses = ['ACTIVE', 'NEUTRALISED'] as const;

  const loadMarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/ig_marks.json`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load marks data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle empty array case
      if (!Array.isArray(data) || data.length === 0) {
        setMarks([]);
        setLastUpdated(new Date());
        return;
      }
      
      // Handle both old format (array of strings) and new format (array of objects)
      let markObjects: InstagramMark[];
      
      if (typeof data[0] === 'string') {
        // Old format - convert strings to mark objects
        markObjects = data.map((username: string, index: number) => ({
          username: String(username),
          status: statuses[index % statuses.length] as 'ACTIVE' | 'NEUTRALISED',
          threatLevel: threatLevels[index % threatLevels.length] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          dateAdded: new Date().toISOString().split('T')[0]
        }));
      } else {
        // New format - use objects directly, but ensure proper typing and string conversion
        markObjects = data.map((mark: any) => ({
          username: String(mark.username || mark || 'unknown'),
          status: (mark.status || 'ACTIVE') as 'ACTIVE' | 'NEUTRALISED',
          threatLevel: (mark.threatLevel || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          dateAdded: String(mark.dateAdded || new Date().toISOString().split('T')[0])
        }));
      }
      
      setMarks(markObjects);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marks');
      console.error('Error loading marks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadMarks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'ACTIVE' | 'NEUTRALISED') => {
    switch (status) {
      case 'ACTIVE':
        return 'text-red-400';
      case 'NEUTRALISED':
        return 'text-green-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getThreatColor = (threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (threatLevel) {
      case 'LOW':
        return 'text-blue-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'CRITICAL':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getThreatIcon = (threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (threatLevel) {
      case 'LOW':
        return <Target className="w-3 h-3" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-3 h-3" />;
      case 'HIGH':
        return <Zap className="w-3 h-3" />;
      case 'CRITICAL':
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: 'ACTIVE' | 'NEUTRALISED') => {
    switch (status) {
      case 'ACTIVE':
        return <Target className="w-3 h-3" />;
      case 'NEUTRALISED':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">MARKS GALLERY</h1>
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            HARMFUL INSTAGRAM ACCOUNTS REPORTED BY THE COMMUNITY
          </p>
          
          {/* Status and Refresh */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading marks...</span>
              </div>
            )}
            {error && (
              <div className="text-sm text-red-400">
                Error: {error}
              </div>
            )}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={loadMarks}
              disabled={loading}
              className="flex items-center space-x-1 text-xs text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {marks.map((mark, index) => (
            <div
              key={mark.username}
              className={`group mission-card hover:border-accent/50 transition-all duration-300 cursor-pointer ${
                mark.status === 'NEUTRALISED' ? 'opacity-50 grayscale' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Instagram Profile Placeholder */}
              <div className="aspect-square bg-muted/20 border border-border mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-accent/60" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className="classified-text text-xs">MARK</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-transparent animate-pulse" />
                
                {/* Neutralised Overlay */}
                {mark.status === 'NEUTRALISED' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-red-500 font-bold text-lg tracking-widest transform -rotate-12">
                      NEUTRALISED
                    </div>
                  </div>
                )}
              </div>

              {/* Mark Info */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-accent font-medium">@{mark.username}</span>
                  <span className="text-xs text-muted-foreground">{mark.dateAdded}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">STATUS:</span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(mark.status)}`}>
                      {getStatusIcon(mark.status)}
                      <span>{mark.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">THREAT:</span>
                    <div className={`flex items-center space-x-1 ${getThreatColor(mark.threatLevel)}`}>
                      {getThreatIcon(mark.threatLevel)}
                      <span>{mark.threatLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>INTEL: <span className="classified-text">REDACTED</span></span>
                    <a
                      href={`https://instagram.com/${mark.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-accent hover:text-accent/80 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mission-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-sm">
            <div>
              <div className="text-2xl font-bold text-red-400">{marks.filter(m => m.status === 'ACTIVE').length}</div>
              <div className="text-xs text-muted-foreground">ACTIVE</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{marks.filter(m => m.status === 'NEUTRALISED').length}</div>
              <div className="text-xs text-muted-foreground">NEUTRALISED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{marks.filter(m => m.threatLevel === 'CRITICAL').length}</div>
              <div className="text-xs text-muted-foreground">CRITICAL</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{marks.length}</div>
              <div className="text-xs text-muted-foreground">TOTAL MARKS</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
            <div>MARKS UPDATED VIA DISCORD BOT MONITORING</div>
            <div className="mt-1 text-accent">PROTECTING INSTAGRAM'S COMMUNITY SINCE 2023</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksGallery;
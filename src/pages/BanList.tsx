import { Shield, Ban, AlertTriangle, RefreshCw, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

interface BannedUser {
  username: string;
  dateAdded: string;
  reason?: string;
}

const BanList = () => {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showFullList, setShowFullList] = useState(false);

  const loadBanList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ban list from the current domain
      const response = await fetch('/ban_list.txt', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ban list: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.text();
      
      // Handle empty file case
      if (!data.trim()) {
        setBannedUsers([]);
        setLastUpdated(new Date());
        return;
      }
      
      // Parse text file (one username per line)
      const usernames = data.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      // Convert to banned user objects
      const bannedUserObjects: BannedUser[] = usernames.map((username) => ({
        username: username.replace('@', ''), // Remove @ if present
        dateAdded: new Date().toISOString().split('T')[0],
        reason: 'Community reported'
      }));
      
      setBannedUsers(bannedUserObjects);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ban list');
      console.error('Error loading ban list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanList();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadBanList, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const displayedUsers = showFullList ? bannedUsers : bannedUsers.slice(0, 12);

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Ban className="w-5 h-5 text-red-400" />
            <h1 className="text-4xl font-display font-medium tracking-wide">BAN LIST</h1>
            <Ban className="w-5 h-5 text-red-400" />
          </div>
          <div className="h-px w-24 bg-red-400 mx-auto opacity-60 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            COMMUNITY BANNED INSTAGRAM ACCOUNTS
          </p>
          
          {/* Status and Refresh */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading ban list...</span>
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
              onClick={loadBanList}
              disabled={loading}
              className="flex items-center space-x-1 text-xs text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Ban List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {displayedUsers.map((user, index) => (
            <div
              key={user.username}
              className="group mission-card hover:border-red-400/50 transition-all duration-300 p-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Banned User Info */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">@{user.username}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.dateAdded}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">STATUS:</span>
                    <div className="flex items-center space-x-1 text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>BANNED</span>
                    </div>
                  </div>
                  {user.reason && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">REASON:</span>
                      <span className="text-xs text-yellow-400">{user.reason}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>ACTION: <span className="text-red-400">BLOCKED</span></span>
                    <a
                      href={`https://instagram.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-accent hover:text-accent/80 transition-colors"
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

        {/* Show More/Less Button */}
        {bannedUsers.length > 12 && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowFullList(!showFullList)}
              className="flex items-center space-x-2 mx-auto px-4 py-2 border border-border rounded-md hover:border-accent/50 transition-colors text-sm font-mono"
            >
              {showFullList ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>
                {showFullList 
                  ? `Show Less (${bannedUsers.length - 12} hidden)` 
                  : `Show All (${bannedUsers.length - 12} more)`
                }
              </span>
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mission-card">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center font-mono text-sm">
            <div>
              <div className="text-2xl font-bold text-red-400">{bannedUsers.length}</div>
              <div className="text-xs text-muted-foreground">TOTAL BANNED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{bannedUsers.filter(u => u.reason === 'Community reported').length}</div>
              <div className="text-xs text-muted-foreground">COMMUNITY REPORTS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{new Date().toISOString().split('T')[0]}</div>
              <div className="text-xs text-muted-foreground">LAST UPDATED</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
            <div>BAN LIST UPDATED VIA MANUAL UPLOAD</div>
            <div className="mt-1 text-red-400">PROTECTING THE COMMUNITY FROM HARMFUL ACCOUNTS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BanList;

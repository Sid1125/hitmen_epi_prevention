import { Users, AlertTriangle, Info, Clock } from "lucide-react";

const Intel = () => {
  const reports = [
    {
      id: "INTEL_2024_001",
      timestamp: "2024-01-15 23:47:32",
      priority: "HIGH",
      source: "FIELD_AGENT_07",
      summary: "Mass account suspension wave detected",
      status: "VERIFIED",
    },
    {
      id: "INTEL_2024_002", 
      timestamp: "2024-01-14 16:23:11",
      priority: "MEDIUM",
      source: "DIGITAL_RECON",
      summary: "Algorithm modification targeting specific content",
      status: "ANALYZING",
    },
    {
      id: "INTEL_2024_003",
      timestamp: "2024-01-13 08:15:47",
      priority: "LOW",
      source: "INTERCEPTED_COMMS",
      summary: "Internal policy change documentation",
      status: "ARCHIVED",
    },
    {
      id: "INTEL_2024_004",
      timestamp: "2024-01-12 19:32:28",
      priority: "HIGH",
      source: "WHISTLEBLOWER",
      summary: "Evidence of coordinated suppression campaign",
      status: "CLASSIFIED",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-accent";
      case "MEDIUM":
        return "text-yellow-500";
      case "LOW":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "text-green-400";
      case "ANALYZING":
        return "text-yellow-500";
      case "CLASSIFIED":
        return "text-accent";
      case "ARCHIVED":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">INTELLIGENCE</h1>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            FIELD REPORTS & SURVEILLANCE DATA
          </p>
        </div>

        {/* Latest Alert */}
        <div className="mission-card border-accent/50 bg-accent/5 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mono text-accent font-medium">PRIORITY ALERT</h3>
                <span className="text-xs font-mono text-muted-foreground">LIVE</span>
              </div>
              <p className="text-sm mb-3">
                Massive platform policy changes detected. Estimated impact: 
                <span className="text-accent font-medium"> 2.3M creators</span>. 
                Recommend immediate protocol activation.
              </p>
              <div className="text-xs font-mono text-muted-foreground">
                SOURCE: <span className="classified-text">REDACTED</span> • 
                CONFIDENCE: 96% • 
                VERIFICATION: PENDING
              </div>
            </div>
          </div>
        </div>

        {/* Intel Reports */}
        <div className="space-y-4">
          <h2 className="text-lg font-mono text-accent mb-6">RECENT INTELLIGENCE</h2>
          
          {reports.map((report, index) => (
            <div
              key={report.id}
              className="mission-card hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Info className="w-4 h-4 text-accent mt-1" />
                  <div>
                    <h3 className="font-mono text-sm font-medium">{report.id}</h3>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className={getPriorityColor(report.priority)}>
                    {report.priority}
                  </div>
                  <div className={`mt-1 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs font-mono text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{report.timestamp}</span>
                  </div>
                  <div>
                    SOURCE: <span className="classified-text">{report.source}</span>
                  </div>
                </div>
                <button className="text-accent hover:text-accent/80 transition-colors">
                  ACCESS FULL REPORT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence Summary */}
        <div className="mt-12 mission-card">
          <h3 className="font-mono text-accent mb-4">THREAT ASSESSMENT SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-accent">47</div>
              <div className="text-xs font-mono text-muted-foreground">ACTIVE THREATS</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-500">23</div>
              <div className="text-xs font-mono text-muted-foreground">UNDER INVESTIGATION</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">156</div>
              <div className="text-xs font-mono text-muted-foreground">NEUTRALIZED</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
            NEXT UPDATE: <span className="classified-text">REDACTED</span> • 
            ANALYST: <span className="classified-text">REDACTED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intel;
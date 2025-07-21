import { Shield, Eye, EyeOff } from "lucide-react";

const MarksGallery = () => {
  const marks = [
    { id: "MARK_001", status: "SILENCED", threat: "HIGH", classification: "REDACTED" },
    { id: "MARK_002", status: "SHADOW_BANNED", threat: "MEDIUM", classification: "REDACTED" },
    { id: "MARK_003", status: "TERMINATED", threat: "HIGH", classification: "REDACTED" },
    { id: "MARK_004", status: "UNDER_WATCH", threat: "LOW", classification: "REDACTED" },
    { id: "MARK_005", status: "SILENCED", threat: "HIGH", classification: "REDACTED" },
    { id: "MARK_006", status: "APPEAL_DENIED", threat: "MEDIUM", classification: "REDACTED" },
    { id: "MARK_007", status: "TERMINATED", threat: "HIGH", classification: "REDACTED" },
    { id: "MARK_008", status: "SHADOW_BANNED", threat: "MEDIUM", classification: "REDACTED" },
    { id: "MARK_009", status: "UNDER_WATCH", threat: "LOW", classification: "REDACTED" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SILENCED":
      case "TERMINATED":
        return "text-accent";
      case "SHADOW_BANNED":
      case "APPEAL_DENIED":
        return "text-yellow-500";
      case "UNDER_WATCH":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="pt-24 pb-16 px-6">
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
            CASUALTIES OF THE INFORMATION WAR
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {marks.map((mark, index) => (
            <div
              key={mark.id}
              className="group mission-card hover:border-accent/50 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Censored Image Placeholder */}
              <div className="aspect-square bg-muted/20 border border-border mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <EyeOff className="w-8 h-8 text-accent/60" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className="classified-text text-xs">CLASSIFIED</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-transparent animate-pulse" />
              </div>

              {/* Mark Info */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-accent font-medium">{mark.id}</span>
                  <span className="text-xs text-muted-foreground">{mark.classification}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">STATUS:</span>
                    <span className={getStatusColor(mark.status)}>{mark.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">THREAT:</span>
                    <span className={getStatusColor(mark.status)}>{mark.threat}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>INTEL: <span className="classified-text">REDACTED</span></span>
                    <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
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
              <div className="text-2xl font-bold text-accent">127</div>
              <div className="text-xs text-muted-foreground">TOTAL MARKS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">89</div>
              <div className="text-xs text-muted-foreground">SILENCED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">23</div>
              <div className="text-xs text-muted-foreground">UNDER REVIEW</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">15</div>
              <div className="text-xs text-muted-foreground">MONITORING</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksGallery;
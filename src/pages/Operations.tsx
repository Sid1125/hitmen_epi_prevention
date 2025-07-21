import { Radar, Target, Zap, Shield, Clock } from "lucide-react";

const Operations = () => {
  const operations = [
    {
      id: "OP_NIGHTFALL",
      status: "ACTIVE",
      classification: "TOP SECRET",
      objective: "Counter-surveillance deployment",
      progress: 78,
      icon: Target,
    },
    {
      id: "OP_GHOSTWRITE",
      status: "COMPLETE",
      classification: "SECRET",
      objective: "Information restoration protocol",
      progress: 100,
      icon: Shield,
    },
    {
      id: "OP_BLACKOUT",
      status: "STANDBY",
      classification: "TOP SECRET",
      objective: "Strategic silence enforcement",
      progress: 45,
      icon: Zap,
    },
    {
      id: "OP_PHOENIX",
      status: "PLANNING",
      classification: "CLASSIFIED",
      objective: "Digital resurrection initiative",
      progress: 12,
      icon: Clock,
    },
  ];

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

        {/* Operations List */}
        <div className="space-y-6">
          {operations.map((op, index) => {
            const Icon = op.icon;
            return (
              <div
                key={op.id}
                className="mission-card hover:border-accent/50 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border border-accent/30 rounded bg-accent/10">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono font-medium text-accent">{op.id}</h3>
                      <p className="text-sm text-muted-foreground">{op.objective}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono ${getStatusColor(op.status)}`}>
                      {op.status}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {op.classification}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">PROGRESS</span>
                    <span className="text-accent">{op.progress}%</span>
                  </div>
                  <div className="w-full bg-muted/20 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-1000 ease-out"
                      style={{ width: `${op.progress}%` }}
                    />
                  </div>
                </div>

                {/* Mission Details */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">COMMANDER:</span>
                      <span className="ml-2 classified-text">REDACTED</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TIMELINE:</span>
                      <span className="ml-2 classified-text">REDACTED</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ASSETS:</span>
                      <span className="ml-2 classified-text">REDACTED</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RISK LEVEL:</span>
                      <span className="ml-2 text-accent">HIGH</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Command Center Footer */}
        <div className="mt-12 mission-card bg-accent/5 border-accent/30">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="font-mono text-sm text-accent">COMMAND AUTHENTICATED</span>
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              ALL OPERATIONS PROCEED UNDER PROTOCOL EPSILON
            </div>
            <div className="text-xs text-muted-foreground">
              NEXT BRIEFING: <span className="classified-text">REDACTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
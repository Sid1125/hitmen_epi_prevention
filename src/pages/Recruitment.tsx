import { UserPlus, Mail, Lock, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const Recruitment = () => {
  const [showEmail, setShowEmail] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isWatching, setIsWatching] = useState(false);

  const message = "We will contact you.";

  useEffect(() => {
    // Typing animation
    if (typedText.length < message.length) {
      const timeout = setTimeout(() => {
        setTypedText(message.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [typedText, message]);

  useEffect(() => {
    // Simulate "watching" effect
    const interval = setInterval(() => {
      setIsWatching(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <UserPlus className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">RECRUITMENT</h1>
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60" />
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Clearance Check */}
          <div className="mission-card text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-mono text-accent">JOIN THE MISSION</h2>
                <p className="text-sm text-muted-foreground">
                  Help protect children from harmful content on Instagram.
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="text-muted-foreground">
                  INSTAGRAM: <span className="text-accent">@you.are.a.hitman</span>
                </div>
                <div className="text-muted-foreground">
                  FOLLOWERS: <span className="text-accent">500,000+</span>
                </div>
                <div className="text-muted-foreground">
                  ELIMINATED: <span className="text-accent">2,040+ accounts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Method */}
          <div className="mission-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-accent">COMMUNICATION PROTOCOL</h3>
                <div className="flex items-center space-x-2">
                  <Eye className={`w-4 h-4 transition-colors duration-500 ${isWatching ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-mono text-muted-foreground">
                    {isWatching ? 'MONITORING' : 'STANDBY'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Join 500,000+ digital guardians in the fight against harmful content. 
                  Join our Discord for coordination and follow @you.are.a.hitman for daily marks.
                </p>

                <div className="space-y-3">
                  <div className="p-4 border border-accent/30 bg-accent/5">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono text-sm">
                          <a 
                            href="https://discord.gg/htmn" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors underline"
                          >
                            discord.gg/htmn
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Main coordination hub • Strategy discussion • Community updates
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-accent/30 bg-accent/5">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono text-sm">
                          <a 
                            href="https://www.instagram.com/you.are.a.hitman/" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors underline"
                          >
                            @you.are.a.hitman
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Follow for daily marks • Report harmful content • Protect children
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <div className="font-mono text-lg text-foreground mb-2">
                    Together we protect.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Every report counts. Every child matters.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mission-card">
            <h3 className="font-mono text-accent mb-4">HOW TO JOIN THE MISSION</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Join Discord server: discord.gg/htmn</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Follow @you.are.a.hitman on Instagram</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Watch for daily marks (harmful accounts)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Report marked accounts for ToS violations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Help protect children from harmful content</span>
              </div>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="text-center text-xs font-mono text-muted-foreground space-y-1">
            <div>ALWAYS FOLLOW INSTAGRAM COMMUNITY GUIDELINES</div>
            <div>REPORT ONLY ACTUAL VIOLATIONS</div>
            <div>TOGETHER WE MAKE INSTAGRAM SAFER</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
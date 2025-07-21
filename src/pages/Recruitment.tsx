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
                <h2 className="text-xl font-mono text-accent">SECURITY CLEARANCE REQUIRED</h2>
                <p className="text-sm text-muted-foreground">
                  Access to recruitment protocols is restricted to verified personnel only.
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="text-muted-foreground">
                  CLEARANCE LEVEL: <span className="classified-text">REDACTED</span>
                </div>
                <div className="text-muted-foreground">
                  AUTHORIZATION: <span className="classified-text">REDACTED</span>
                </div>
                <div className="text-muted-foreground">
                  BACKGROUND CHECK: <span className="text-accent">REQUIRED</span>
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
                  Direct contact is not permitted through conventional channels. 
                  Potential recruits must demonstrate capability before consideration.
                </p>

                <div className="p-4 border border-accent/30 bg-accent/5">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-mono text-sm">
                        {showEmail ? (
                          <span className="text-accent">recruitment@[REDACTED].onion</span>
                        ) : (
                          <button
                            onClick={() => setShowEmail(true)}
                            className="text-accent hover:text-accent/80 transition-colors underline"
                          >
                            [CLICK TO REVEAL CONTACT]
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Tor network access required • PGP encryption mandatory
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <div className="font-mono text-lg text-foreground mb-2">
                    {typedText}
                    <span className="animate-pulse text-accent">|</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Do not attempt to contact us. We are already aware.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mission-card">
            <h3 className="font-mono text-accent mb-4">MINIMUM REQUIREMENTS</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Proven track record in digital operations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Advanced knowledge of platform architectures</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Ability to operate under extreme discretion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span>Clearance level: <span className="classified-text">REDACTED</span></span>
              </div>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="text-center text-xs font-mono text-muted-foreground space-y-1">
            <div>THIS COMMUNICATION IS MONITORED</div>
            <div>UNAUTHORIZED ACCESS WILL BE PROSECUTED</div>
            <div>PROCEED WITH EXTREME CAUTION</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
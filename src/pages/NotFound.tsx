import { AlertTriangle, ArrowLeft, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const [glitchText, setGlitchText] = useState("MISSION COMPROMISED");
  const [isGlitching, setIsGlitching] = useState(false);

  const glitchChars = "!@#$%^&*()_+[]{}|;:,.<>?";
  const originalText = "MISSION COMPROMISED";

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      
      // Create glitch effect
      const glitchTimeout = setTimeout(() => {
        let glitched = "";
        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() < 0.3) {
            glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          } else {
            glitched += originalText[i];
          }
        }
        setGlitchText(glitched);

        // Return to normal after brief glitch
        setTimeout(() => {
          setGlitchText(originalText);
          setIsGlitching(false);
        }, 150);
      }, 100);

      return () => clearTimeout(glitchTimeout);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Background static effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-accent/20 to-transparent animate-pulse" />
      </div>

      <div className="text-center space-y-8 animate-fade-in relative z-10">
        {/* Error Icon */}
        <br></br><br></br>
        <div className="flex justify-center">
          <div className="p-4 border border-accent rounded-full bg-accent/10">
            <AlertTriangle className="w-12 h-12 text-accent" />
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-4">
          <div className="font-mono text-6xl md:text-8xl font-bold text-accent">
            404
          </div>
          <div className={`font-mono text-xl md:text-2xl tracking-wider transition-all duration-150 ${
            isGlitching ? 'text-accent animate-pulse' : 'text-foreground'
          }`}>
            {glitchText}
          </div>
        </div>

        {/* Error Details */}
        <div className="mission-card max-w-md">
          <div className="space-y-4 text-sm">
            <div className="border-b border-border pb-4 mb-4">
              <div className="font-mono text-accent mb-2">ERROR REPORT</div>
              <div className="space-y-1 text-xs font-mono text-muted-foreground">
                <div>STATUS: RESOURCE NOT FOUND</div>
                <div>TIMESTAMP: {new Date().toISOString()}</div>
                <div>LOCATION: <span className="classified-text">REDACTED</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">
                The requested operation could not be completed. 
                The target resource has been classified or relocated.
              </p>
              
              <div className="p-3 border border-accent/30 bg-accent/5">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <Target className="w-3 h-3 text-accent" />
                  <span className="text-accent">SECURITY PROTOCOL ACTIVATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO BASE</span>
          </Link>
          
          <div className="text-xs font-mono text-muted-foreground">
            OR AWAIT FURTHER INSTRUCTIONS
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 space-y-2 text-xs font-mono text-muted-foreground">
          <div>INCIDENT ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          <div>CLASSIFICATION: UNCLASSIFIED</div>
          <div>RESPONSE TEAM: <span className="classified-text">REDACTED</span></div>
          <br></br><br></br>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

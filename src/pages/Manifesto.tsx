import { FileText, Lock } from "lucide-react";

const Manifesto = () => {
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lock className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">MANIFESTO</h1>
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60" />
        </div>

        {/* Document Header */}
        <div className="mission-card mb-8 font-mono text-sm">
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-accent">CLASSIFIED DOCUMENT</span>
              <span className="text-muted-foreground">EPI-PREV-001</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>CLEARANCE LEVEL: <span className="classified-text">REDACTED</span></div>
              <div>DISTRIBUTION: NEED TO KNOW BASIS</div>
              <div>CLASSIFICATION: TOP SECRET</div>
            </div>
          </div>

          <div className="space-y-4 text-foreground leading-relaxed">
            <h2 className="text-lg font-semibold text-accent mb-3">MISSION STATEMENT</h2>
            
            <p>
              In the shadows of digital surveillance, where privacy dies and freedom bleeds, 
              we stand as guardians of the last frontier. The HITMEN protocol is not revenge—it is justice.
            </p>

            <p>
              Every account silenced. Every voice suppressed. Every creator <span className="classified-text">REDACTED</span> 
              for speaking truth. We remember. We document. We act.
            </p>

            <h3 className="text-accent font-medium mt-6 mb-2">CORE PRINCIPLES</h3>
            
            <div className="space-y-3 pl-4">
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Preserve digital integrity at all costs</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Document systematic suppression</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Strike swift, silent, and decisive</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Leave no digital fingerprint</span>
              </div>
            </div>

            <div className="mt-8 p-4 border border-accent/30 bg-accent/5">
              <p className="text-center italic text-accent">
                "In shadows we trust. In silence we strike. The mission is classified. 
                The method is art. The result is inevitable."
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>AUTHORIZED BY: <span className="classified-text">REDACTED</span></span>
                <span>DATE: <span className="classified-text">REDACTED</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="text-center text-xs font-mono text-muted-foreground">
          ACCESS LEVEL VERIFIED • PROCEED TO OPERATIONS
        </div>
      </div>
    </div>
  );
};

export default Manifesto;
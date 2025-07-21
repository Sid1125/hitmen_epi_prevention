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
              <span className="text-accent">MISSION BRIEF</span>
              <span className="text-muted-foreground">EPI-PREV-001</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>OPERATION: EARLY PORN INTRODUCTION PREVENTION</div>
              <div>PLATFORM: INSTAGRAM (@you.are.a.hitman)</div>
              <div>CLASSIFICATION: COMMUNITY INITIATIVE</div>
            </div>
          </div>

          <div className="space-y-4 text-foreground leading-relaxed">
            <h2 className="text-lg font-semibold text-accent mb-3">MISSION STATEMENT</h2>
            
            <p>
              In the digital age where harmful content spreads unchecked, where children are exposed 
              to inappropriate material, and where platform moderation fails - we stand as guardians. 
              The HITMEN community is not about vigilantism—it is about digital child safety.
            </p>

            <p>
              Every inappropriate account active. Every disturbing post spreading. Every young mind 
              at risk from <strong>Early Porn Introduction</strong>. We document. We report. We protect.
            </p>

            <p className="text-accent font-medium">
              With 500,000+ digital guardians and 2,040+ harmful accounts eliminated, 
              we are Instagram's most effective community moderation force.
            </p>

            <h3 className="text-accent font-medium mt-6 mb-2">CORE PRINCIPLES</h3>
            
            <div className="space-y-3 pl-4">
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Protect children from Early Porn Introduction (EPI)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Document and report harmful content systematically</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Coordinate community-driven content moderation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Support Instagram's Terms of Service enforcement</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent mt-1">•</span>
                <span>Maintain transparency in all reporting activities</span>
              </div>
            </div>

            <div className="mt-8 p-4 border border-accent/30 bg-accent/5">
              <p className="text-center italic text-accent">
                "In unity we protect. In numbers we succeed. Together we shield the innocent 
                from digital harm. Follow @you.are.a.hitman - Join the mission."
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>COMMUNITY LEADERS: @you.are.a.hitman</span>
                <span>ESTABLISHED: 2023</span>
              </div>
              <div className="mt-2 text-center">
                <span>VERIFIED ELIMINATIONS: 2,040+ • ACTIVE AGENTS: 500,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="text-center text-xs font-mono text-muted-foreground">
          FOLLOW @YOU.ARE.A.HITMAN ON INSTAGRAM • JOIN THE DIGITAL PROTECTION FORCE
        </div>
      </div>
    </div>
  );
};

export default Manifesto;
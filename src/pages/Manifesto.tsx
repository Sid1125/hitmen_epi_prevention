import { FileText, Lock } from "lucide-react";

const Manifesto = () => {
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lock className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-widest uppercase">Manifesto</h1>
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60" />
        </div>

        {/* Mission Card */}
        <div className="mission-card mb-12 font-mono text-sm border border-muted/40 p-6 bg-background/80 shadow-inner animate-fade-in">
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex justify-between items-center text-xs uppercase font-semibold text-accent">
              <span>Mission Brief</span>
              <span className="text-muted-foreground">EPI-PREV-001</span>
            </div>
            <div className="space-y-1 text-muted-foreground mt-2 text-xs">
              <div>OPERATION: <strong className="text-foreground">Early Porn Introduction Prevention</strong></div>
              <div>PLATFORM: Instagram <span className="text-accent">(@you.are.a.hitman)</span></div>
              <div>CLASSIFICATION: Community Initiative</div>
            </div>
          </div>

          <div className="space-y-5 leading-relaxed text-foreground text-sm">
            <h2 className="text-lg font-semibold text-accent">MISSION STATEMENT</h2>
            <p>
              In a digital landscape where children scroll before they speak, danger is just one swipe away.
              Platforms fail. Filters fail. But we do not.
            </p>

            <p>
              HITMEN isn't a rebellion — it's a defense. Against <span className="font-bold">EPI (Early Porn Introduction)</span>, 
              against unregulated exposure, and against those who prey on the unaware.
            </p>

            <p className="text-accent font-medium">
              500,000+ agents deployed. 2,040+ accounts neutralized. Instagram’s most effective civilian strikeforce.
            </p>

            <h3 className="text-accent font-semibold mt-6">CORE PRINCIPLES</h3>
            <ul className="list-none pl-4 space-y-2 text-sm">
              <li className="flex items-start space-x-2"><span className="text-accent mt-1">→</span><span>Shield young users from EPI</span></li>
              <li className="flex items-start space-x-2"><span className="text-accent mt-1">→</span><span>Detect, document, and report at scale</span></li>
              <li className="flex items-start space-x-2"><span className="text-accent mt-1">→</span><span>Mobilize through community coordination</span></li>
              <li className="flex items-start space-x-2"><span className="text-accent mt-1">→</span><span>Uphold platform integrity—without apology</span></li>
              <li className="flex items-start space-x-2"><span className="text-accent mt-1">→</span><span>Operate transparently under digital law</span></li>
            </ul>

            <div className="mt-8 p-4 border border-accent/50 bg-accent/5 text-center italic text-accent rounded-sm shadow-md">
              "In unity we protect. In numbers we succeed. Together we shield the innocent 
              from digital harm. <strong className="text-foreground"><br></br>Follow @you.are.a.hitman — Join the mission.</strong>"
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Community Lead: <span className="text-accent">@you.are.a.hitman</span></span>
                <span>Founded: 2023</span>
              </div>
              <div className="mt-2 text-center text-accent font-semibold">
                VERIFIED ELIMINATIONS: 2,040+ • ACTIVE AGENTS: 508,000+
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="text-center text-xs font-mono text-muted-foreground tracking-wide animate-fade-in-up">
          FOLLOW <span className="text-accent">@you.are.a.hitman</span> ON INSTAGRAM • ENLIST. DEFEND. PROTECT.
        </div>
      </div>
    </div>
  );
};

export default Manifesto;

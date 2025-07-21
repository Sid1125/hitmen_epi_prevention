import { Target, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Hero Section */}
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Target className="w-8 h-8 text-accent" />
            <h1 className="text-6xl md:text-8xl font-display font-medium tracking-wider">
              HITMEN
            </h1>
            <Target className="w-8 h-8 text-accent" />
          </div>
          
          <div className="h-px w-32 bg-accent mx-auto opacity-60" />
          
          <p className="text-xl md:text-2xl font-light tracking-wide text-muted-foreground">
            Move in silence.
          </p>
        </div>

        {/* Mission Status */}
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-center space-x-4 text-hitmen-terminal">
            <span>CLEARANCE: <span className="classified-text">REDACTED</span></span>
            <span>STATUS: ACTIVE</span>
          </div>
          <div className="text-xs text-muted-foreground">
            LAST UPDATE: {new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {/* Enter Button */}
        <div className="pt-8">
          <Link
            to="/manifesto"
            className="group inline-flex items-center space-x-2 border border-accent px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <span className="font-mono tracking-wider">ENTER</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-xs font-mono text-muted-foreground">
        <div>
          PROTOCOL: EPI PREVENTION
        </div>
        <div className="text-right">
          TRANSMISSION SECURE<br />
          NODE: CLASSIFIED
        </div>
      </div>
    </div>
  );
};

export default Index;

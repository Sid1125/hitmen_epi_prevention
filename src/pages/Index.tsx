import { Target, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const messages = [
  "Deploying Operation BLACKOUT...",
  "Encrypted node link established.",
  "Asset extraction in progress...",
  "Recon satellites online.",
  "Safehouse status: GREEN",
];

export const RotatingMessage = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return <span>{messages[index]}</span>;
};

export const AnimatedCounter = ({ to = 500000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const step = Math.ceil(to / 100);
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= to) {
          clearInterval(interval);
          return to;
        }
        return prev + step;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [to]);

  return <span>{count.toLocaleString()}</span>;
};


const Index = () => {
  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />

      {/* Hero Section */}
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-wider">
              HITMEN
            </h1>
          </div>
          
          <div className="h-px w-32 bg-accent mx-auto opacity-60" />
          
          <p className="text-xl md:text-2xl font-light tracking-wide text-muted-foreground">
            Move in silence.
          </p>
          <p className="text-base font-mono text-muted-foreground h-6 animate-fade-in-slow">
            <RotatingMessage />
          </p>

        </div>

        {/* Mission Status */}
        <div className="space-y-2 font-mono text-base">
          <div className="flex justify-center space-x-4 text-hitmen-terminal">
            <span>MISSION: EPI PREVENTION</span>
            <span>STATUS: ACTIVE</span>
          </div>
          <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
            <span>MARKS ELIMINATED: 2350+</span>
            <span>AGENTS: <AnimatedCounter to={508000} /></span>

          </div>
          <div className="text-sm text-muted-foreground">
            LAST UPDATE: {new Date().toISOString().split('T')[0]}
          </div>
        </div>
        {/* The Directive */}
        <div className="mt-12 text-center text-base font-mono text-muted-foreground border border-muted px-4 py-3 w-fit mx-auto">
          <p className="text-accent font-bold">THE DIRECTIVE</p>
          <p>Prevent exposure. Neutralize risks. Stay unseen.</p>
        </div>

        {/* Enter Button */}
        <div className="pt-8">
          <Link
            to="/manifesto"
            className="group inline-flex items-center space-x-2 border border-accent px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <span className="font-mono tracking-wider scanline group-hover:translate-y-1 transition-transform">ENTER</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform scanline" />
          </Link>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-sm font-mono text-muted-foreground">
        <div>
          PROTOCOL: EARLY PORN INTRODUCTION PREVENTION
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

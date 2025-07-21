import { NavLink } from "react-router-dom";
import { Target, Shield, Users, FileText, Radar, UserPlus } from "lucide-react";

const Navigation = () => {
  const navItems = [
    { path: "/", icon: Target, label: "HOME" },
    { path: "/manifesto", icon: FileText, label: "MANIFESTO" },
    { path: "/marks", icon: Shield, label: "MARKS" },
    { path: "/operations", icon: Radar, label: "OPS" },
    { path: "/intel", icon: Users, label: "INTEL" },
    { path: "/recruitment", icon: UserPlus, label: "RECRUIT" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2 hover-glow">
            <Target className="w-5 h-5" />
            <span className="font-display font-medium tracking-wide">HITMEN</span>
          </NavLink>
          
          <div className="flex space-x-8">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-1 text-sm font-mono tracking-wider transition-colors duration-300 ${
                      isActive
                        ? "text-accent"
                        : "text-foreground hover:text-accent"
                    }`
                  }
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
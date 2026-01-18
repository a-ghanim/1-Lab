import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Atom, 
  Home, 
  Settings, 
  LogOut, 
  ChevronDown,
  Flame,
  User,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showNav && isAuthenticated && (
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Atom className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-lg hidden sm:block">One Breath Lab</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href || location.startsWith(item.href + "/");
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">0</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
                      data-testid="button-user-menu"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 w-full cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  className="md:hidden p-2 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border/50 bg-card"
              >
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                          ${isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      <main className={showNav && isAuthenticated ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
}

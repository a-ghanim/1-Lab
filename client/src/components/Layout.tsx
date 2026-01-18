import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { 
  Settings, 
  LogOut, 
  ChevronDown,
  Flame,
  User,
  Sun,
  Moon,
  Bookmark,
  Brain,
  Folder
} from "lucide-react";
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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground dot-grid">
      {showNav && isAuthenticated && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 bg-primary" />
                <span className="font-semibold hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>1Lab</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-muted transition-colors"
                  data-testid="button-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Moon className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 p-1 hover:bg-muted transition-colors"
                      data-testid="button-user-menu"
                    >
                      <div className="w-7 h-7 bg-muted flex items-center justify-center overflow-hidden">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/daily-review" className="flex items-center gap-2 w-full cursor-pointer" data-testid="link-daily-review">
                        <Brain className="w-4 h-4" />
                        Daily Review
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/folders" className="flex items-center gap-2 w-full cursor-pointer" data-testid="link-folders">
                        <Folder className="w-4 h-4" />
                        Folders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks" className="flex items-center gap-2 w-full cursor-pointer">
                        <Bookmark className="w-4 h-4" />
                        Bookmarks
                      </Link>
                    </DropdownMenuItem>
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
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={showNav && isAuthenticated ? "pt-14" : ""}>
        {children}
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Menu, X, User, LogOut, Home, Activity, Mic, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    }
    setIsOpen(false);
  };

  const navigationItems = [
    { to: "/", label: "Home", icon: Home },
    ...(user ? [
      { to: "/dashboard", label: "Dashboard", icon: Activity },
      { to: "/recording", label: "Recording", icon: Mic },
    ] : [])
  ];

  return (
    <>
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow shadow-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Cardia Sentinel AI
              </span>
              <span className="text-lg font-bold text-foreground sm:hidden">
                Cardia Sentinel AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary/50"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                  </div>
                  <Link to="/settings">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="cardiac" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-6 border-b border-border">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                        <Heart className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        Cardia Sentinel AI
                      </span>
                    </div>

                    {/* User Info */}
                    {user && (
                      <div className="py-6 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">Welcome back!</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Items */}
                    <div className="flex-1 py-6">
                      <nav className="space-y-2">
                        {navigationItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-border space-y-3">
                      {user ? (
                        <>
                          <Link to="/settings" onClick={() => setIsOpen(false)}>
                            <Button
                              variant="ghost"
                              className="w-full gap-2 justify-start"
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </Button>
                          </Link>
                          <Button
                            onClick={handleSignOut}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <Button variant="cardiac" className="w-full gap-2">
                            <User className="h-4 w-4" />
                            Sign In
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
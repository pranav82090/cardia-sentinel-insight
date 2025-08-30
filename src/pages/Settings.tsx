import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Trash2, 
  ArrowLeft,
  AlertTriangle,
  Settings as SettingsIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  const deleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmEmail !== user.email) {
      toast({
        title: "Email Confirmation Required",
        description: "Please type your email address exactly to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // Delete user data from all tables
      await Promise.all([
        supabase.from('profiles').delete().eq('id', user.id),
        supabase.from('heart_recordings').delete().eq('user_id', user.id),
        supabase.from('api_settings').delete().eq('user_id', user.id)
      ]);
      
      // Call the delete user function to remove from auth.users
      const { data, error: deleteError } = await supabase.rpc('delete_user');
      
      if (deleteError) {
        console.warn('Delete user function error:', deleteError);
        // Continue with sign out even if function fails
      }
      
      // Sign out the user
      await supabase.auth.signOut();
      
      navigate("/");
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Account Deletion Failed",
        description: "There was an error deleting your account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Mobile-first container */}
      <div className="w-full px-4 py-4 md:px-6 md:py-6">
        {/* Header - Mobile optimized */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your account
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-first single column layout */}
        <div className="space-y-4">
          {/* Account Overview - Mobile Card */}
          <Card className="w-full border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {profile?.name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-foreground font-medium">
                    {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Last sign in</span>
                  <span className="text-foreground font-medium">
                    {new Date(user?.last_sign_in_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full mt-4 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone - Mobile Card */}
          <Card className="w-full border-destructive/20 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <h3 className="font-semibold text-destructive">Danger Zone</h3>
              </div>
              
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all data:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4 pl-2">
                  <li>• Heart recordings and analysis</li>
                  <li>• Profile and preferences</li>
                  <li>• Health metrics and history</li>
                </ul>
                <p className="text-xs font-medium text-destructive mb-4">
                  This cannot be undone!
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Deletion
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        This will permanently delete all your health data, recordings, and analysis results. This cannot be undone.
                        <br /><br />
                        Type your email to confirm:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                      <Input
                        value={deleteConfirmEmail}
                        placeholder={user?.email}
                        onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel 
                        onClick={() => setDeleteConfirmEmail("")}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteAccount}
                        disabled={isDeletingAccount || deleteConfirmEmail !== user?.email}
                        className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAccount ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
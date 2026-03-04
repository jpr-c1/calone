import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          const email = session.user.email;
          
          // Check if email is from cargo.one domain
          if (!email?.endsWith("@cargo.one")) {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "Only @cargo.one email addresses are allowed to sign in.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }

          // Check if user exists in our users table
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("google_id", session.user.id)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            throw fetchError;
          }

          // Create user if doesn't exist
          if (!existingUser) {
            const name = session.user.user_metadata?.full_name || email.split("@")[0];
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const { error: insertError } = await supabase
              .from("users")
              .insert({
                name,
                email,
                google_id: session.user.id,
                initials,
                role: "Team Member",
                google_refresh_token: session.provider_refresh_token || null,
              });

            if (insertError) throw insertError;
          } else if (session.provider_refresh_token) {
            // Update existing user's refresh token if we got a new one
            await supabase
              .from("users")
              .update({ google_refresh_token: session.provider_refresh_token })
              .eq("google_id", session.user.id);
          }

          navigate("/");
        } else {
          navigate("/auth");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast({
          title: "Error",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

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
              });

            if (insertError) throw insertError;
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;

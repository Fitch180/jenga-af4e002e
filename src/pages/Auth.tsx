import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserType = "ordinary" | "merchant";

const countries = [
  "Tanzania",
  "Kenya",
  "Uganda",
  "Rwanda",
  "Burundi",
  "South Africa",
  "Nigeria",
  "Ghana",
  "Ethiopia",
  "Other"
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Signup specific fields
  const [userType, setUserType] = useState<UserType>("ordinary");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Merchant specific fields
  const [businessName, setBusinessName] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [countryRegistered, setCountryRegistered] = useState("");
  const [revenueAuthorityNumber, setRevenueAuthorityNumber] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (userType === "merchant") {
      if (!businessName.trim()) {
        toast({
          title: "Validation Error",
          description: "Business name is required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!countryRegistered) {
        toast({
          title: "Validation Error",
          description: "Country is required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!nationalIdNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "National ID number is required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    const redirectUrl = `${window.location.origin}/`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) {
      toast({
        title: "Signup failed",
        description: authError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      try {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        // Create user role
        const role = userType === "merchant" ? "merchant" : "user";
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: role,
          });

        if (roleError) {
          console.error("Role creation error:", roleError);
        }

        // If merchant, create merchant profile
        if (userType === "merchant") {
          const { error: merchantError } = await supabase
            .from("merchant_profiles")
            .insert({
              user_id: authData.user.id,
              business_name: businessName.trim(),
              business_registration_number: businessRegistrationNumber.trim() || null,
              country_registered: countryRegistered,
              revenue_authority_number: revenueAuthorityNumber.trim() || null,
              national_id_number: nationalIdNumber.trim() || null,
              approval_status: "pending",
            });

          if (merchantError) {
            console.error("Merchant profile creation error:", merchantError);
          }

          toast({
            title: "Account created!",
            description: "Your merchant account is pending approval. You can still browse the app.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "You can now log in with your credentials.",
          });
        }
      } catch (error) {
        console.error("Error creating user data:", error);
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setBusinessRegistrationNumber("");
    setCountryRegistered("");
    setRevenueAuthorityNumber("");
    setNationalIdNumber("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Jenga</CardTitle>
          <CardDescription className="text-center">
            Your housing industry marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={() => resetForm()}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* User Type Selection */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={userType === "ordinary" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUserType("ordinary")}
                  >
                    Ordinary
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "merchant" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUserType("merchant")}
                  >
                    Merchant
                  </Button>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Merchant Specific Fields */}
                {userType === "merchant" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name *</Label>
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="Your Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country Registered *</Label>
                      <Select value={countryRegistered} onValueChange={setCountryRegistered}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-reg">Business Registration Number (Optional)</Label>
                      <Input
                        id="business-reg"
                        type="text"
                        placeholder="e.g., 123456789"
                        value={businessRegistrationNumber}
                        onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revenue-auth">Revenue Authority Number (Optional)</Label>
                      <Input
                        id="revenue-auth"
                        type="text"
                        placeholder="e.g., TIN-123456"
                        value={revenueAuthorityNumber}
                        onChange={(e) => setRevenueAuthorityNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="national-id">National ID Number *</Label>
                      <Input
                        id="national-id"
                        type="text"
                        placeholder="e.g., 19901234-12345-00001-23"
                        value={nationalIdNumber}
                        onChange={(e) => setNationalIdNumber(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : userType === "merchant" ? "Submit for Approval" : "Sign Up"}
                </Button>

                {userType === "merchant" && (
                  <p className="text-xs text-muted-foreground text-center">
                    Merchant accounts require approval before accessing the dashboard.
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

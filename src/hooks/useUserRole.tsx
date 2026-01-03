import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_registration_number: string | null;
  country_registered: string;
  revenue_authority_number: string | null;
  approval_status: "pending" | "approved" | "rejected";
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [isMerchant, setIsMerchant] = useState(false);
  const [isApprovedMerchant, setIsApprovedMerchant] = useState(false);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMerchantStatus = async () => {
      if (!user) {
        setIsMerchant(false);
        setIsApprovedMerchant(false);
        setMerchantProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user has merchant role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "merchant")
          .maybeSingle();

        const hasMerchantRole = !!roleData;
        setIsMerchant(hasMerchantRole);

        if (hasMerchantRole) {
          // Get merchant profile
          const { data: merchantData } = await supabase
            .from("merchant_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (merchantData) {
            setMerchantProfile(merchantData as MerchantProfile);
            setIsApprovedMerchant(merchantData.approval_status === "approved");
          }
        }
      } catch (error) {
        console.error("Error checking merchant status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkMerchantStatus();
  }, [user]);

  return { isMerchant, isApprovedMerchant, merchantProfile, loading };
};

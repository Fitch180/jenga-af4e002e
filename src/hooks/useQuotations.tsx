import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type QuotationStatus = "pending" | "reviewed" | "quoted" | "accepted" | "rejected" | "expired";

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  specifications: string | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  user_id: string;
  merchant_id: string;
  status: QuotationStatus;
  message: string | null;
  merchant_response: string | null;
  quoted_price: number | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  quotation_items?: QuotationItem[];
  merchant_profiles?: {
    business_name: string;
  };
}

export interface CreateQuotationData {
  merchant_id: string;
  message: string;
  items: {
    product_id?: string;
    product_name: string;
    quantity: number;
    specifications?: string;
  }[];
}

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          quotation_items (*),
          merchant_profiles (business_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotations((data as Quotation[]) || []);
    } catch (error: any) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();

    const channel = supabase
      .channel("quotations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotations" },
        () => {
          fetchQuotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQuotations]);

  const createQuotation = async (data: CreateQuotationData): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please login to request a quotation");
        return null;
      }

      // Create quotation
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          user_id: userData.user.id,
          merchant_id: data.merchant_id,
          message: data.message,
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const quotationItems = data.items.map((item) => ({
        quotation_id: quotation.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        specifications: item.specifications || null,
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(quotationItems);

      if (itemsError) throw itemsError;

      toast.success("Quotation request sent successfully!");
      fetchQuotations();
      return quotation.id;
    } catch (error: any) {
      console.error("Error creating quotation:", error);
      toast.error("Failed to send quotation request: " + error.message);
      return null;
    }
  };

  const updateQuotationStatus = async (
    quotationId: string,
    status: QuotationStatus
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("quotations")
        .update({ status })
        .eq("id", quotationId);

      if (error) throw error;

      if (status === "accepted") {
        toast.success("Quotation accepted!");
      } else if (status === "rejected") {
        toast.info("Quotation rejected");
      }

      fetchQuotations();
      return true;
    } catch (error: any) {
      console.error("Error updating quotation status:", error);
      toast.error("Failed to update quotation");
      return false;
    }
  };

  return {
    quotations,
    loading,
    createQuotation,
    updateQuotationStatus,
    refetch: fetchQuotations,
  };
}

export function useMerchantQuotations(merchantId: string | null) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    if (!merchantId) {
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          quotation_items (*)
        `)
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotations((data as Quotation[]) || []);
    } catch (error: any) {
      console.error("Error fetching merchant quotations:", error);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchQuotations();

    if (!merchantId) return;

    const channel = supabase
      .channel(`merchant-quotations-${merchantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotations" },
        () => {
          fetchQuotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQuotations, merchantId]);

  const respondToQuotation = async (
    quotationId: string,
    response: {
      price: number;
      message: string;
      validDays?: number;
    }
  ): Promise<boolean> => {
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (response.validDays || 7));

      const { error } = await supabase
        .from("quotations")
        .update({
          status: "quoted",
          quoted_price: response.price,
          merchant_response: response.message,
          valid_until: validUntil.toISOString(),
        })
        .eq("id", quotationId);

      if (error) throw error;

      toast.success("Quotation sent to customer!");
      fetchQuotations();
      return true;
    } catch (error: any) {
      console.error("Error responding to quotation:", error);
      toast.error("Failed to send quotation response");
      return false;
    }
  };

  const updateQuotationStatus = async (
    quotationId: string,
    status: QuotationStatus
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("quotations")
        .update({ status })
        .eq("id", quotationId);

      if (error) throw error;

      toast.success(`Quotation status updated to ${status}`);
      fetchQuotations();
      return true;
    } catch (error: any) {
      console.error("Error updating quotation status:", error);
      toast.error("Failed to update quotation status");
      return false;
    }
  };

  return {
    quotations,
    loading,
    respondToQuotation,
    updateQuotationStatus,
    refetch: fetchQuotations,
  };
}

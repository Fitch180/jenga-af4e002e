import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export type QuotationStatus = "pending" | "reviewed" | "quoted" | "accepted" | "rejected" | "expired";

export interface QuotationItem {
  productId?: string;
  productName: string;
  quantity: number;
  specifications?: string;
}

export interface Quotation {
  id: string;
  merchantId: number;
  merchantName: string;
  userId: string;
  items: QuotationItem[];
  message: string;
  status: QuotationStatus;
  createdAt: Date;
  updatedAt: Date;
  quotedPrice?: number;
  merchantResponse?: string;
  validUntil?: Date;
}

interface QuotationContextType {
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus, response?: { price?: number; message?: string; validUntil?: Date }) => void;
  getQuotationsByMerchant: (merchantId: number) => Quotation[];
  getUserQuotations: () => Quotation[];
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider = ({ children }: { children: ReactNode }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([
    // Sample data
    {
      id: "QUO-001",
      merchantId: 1,
      merchantName: "Dar Ceramica Center",
      userId: "user-1",
      items: [
        { productName: "Ceramic Floor Tiles", quantity: 100, specifications: "60x60cm, White Marble finish" },
        { productName: "Wall Tiles Premium", quantity: 50, specifications: "30x60cm, Grey" }
      ],
      message: "Need tiles for a 3-bedroom house renovation. Please provide best price for bulk order.",
      status: "quoted",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      quotedPrice: 4250000,
      merchantResponse: "We can offer a 15% discount for bulk orders. Price includes delivery within Dar es Salaam.",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: "QUO-002",
      merchantId: 4,
      merchantName: "Modern Living Furniture",
      userId: "user-1",
      items: [
        { productName: "Modern Sofa Set", quantity: 1 },
        { productName: "Coffee Table", quantity: 2 }
      ],
      message: "Looking for furniture for new office space. Need delivery to Masaki.",
      status: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  const addQuotation = (quotationData: Omit<Quotation, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newQuotation: Quotation = {
      ...quotationData,
      id: `QUO-${Date.now().toString().slice(-6)}`,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setQuotations(prev => [newQuotation, ...prev]);
    toast.success("Quotation request sent successfully!");
  };

  const updateQuotationStatus = (
    id: string, 
    status: QuotationStatus, 
    response?: { price?: number; message?: string; validUntil?: Date }
  ) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        const updated = {
          ...q,
          status,
          updatedAt: new Date(),
          ...(response?.price && { quotedPrice: response.price }),
          ...(response?.message && { merchantResponse: response.message }),
          ...(response?.validUntil && { validUntil: response.validUntil })
        };
        
        // Show notification based on status change
        if (status === "quoted") {
          toast.success(`Quotation ${id} has been responded to!`);
        } else if (status === "accepted") {
          toast.success(`Quotation ${id} accepted!`);
        } else if (status === "rejected") {
          toast.info(`Quotation ${id} was rejected`);
        }
        
        return updated;
      }
      return q;
    }));
  };

  const getQuotationsByMerchant = (merchantId: number) => {
    return quotations.filter(q => q.merchantId === merchantId);
  };

  const getUserQuotations = () => {
    return quotations.filter(q => q.userId === "user-1");
  };

  return (
    <QuotationContext.Provider value={{
      quotations,
      addQuotation,
      updateQuotationStatus,
      getQuotationsByMerchant,
      getUserQuotations
    }}>
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotations = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotations must be used within a QuotationProvider");
  }
  return context;
};

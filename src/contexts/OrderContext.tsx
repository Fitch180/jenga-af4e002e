import React, { createContext, useContext, useState, useEffect } from "react";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "mpesa" | "airtel" | "card";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  region: string;
  district: string;
  street: string;
  landmark?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
  merchant: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: OrderItem[], address: DeliveryAddress, paymentMethod: PaymentMethod, totalAmount: number) => string;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved).map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
    })) : [];
  });

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const createOrder = (items: OrderItem[], address: DeliveryAddress, paymentMethod: PaymentMethod, totalAmount: number): string => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const newOrder: Order = {
      id: orderId,
      items,
      deliveryAddress: address,
      paymentMethod,
      totalAmount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      trackingNumber,
    };

    setOrders(prev => [newOrder, ...prev]);
    return orderId;
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrderById, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
};

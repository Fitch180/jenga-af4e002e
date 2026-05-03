import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, CreditCard, Smartphone, Building2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  merchant_id: string;
  method_type: string;
  provider_name: string | null;
  account_number: string;
  account_name: string;
  receiver_name: string | null;
  is_active: boolean;
  created_at: string;
}

const METHOD_TYPES = [
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "lipa_number", label: "Lipa Number (Pay Number)", icon: CreditCard },
];

const MOBILE_PROVIDERS = ["M-Pesa (Vodacom)", "Tigo Pesa", "Airtel Money", "Halotel"];
const BANK_PROVIDERS = ["CRDB Bank", "NMB Bank", "NBC Bank", "Stanbic Bank", "DTB Bank", "Equity Bank", "Exim Bank", "KCB Bank", "Other"];
const LIPA_PROVIDERS = [...MOBILE_PROVIDERS, ...BANK_PROVIDERS];

interface PaymentMethodsTabProps {
  merchantId: string | null;
}

const PaymentMethodsTab = ({ merchantId }: PaymentMethodsTabProps) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    method_type: "",
    provider_name: "",
    account_number: "",
    account_name: "",
    receiver_name: "",
    is_active: true,
  });

  const fetchMethods = useCallback(async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("merchant_payment_methods")
        .select("*")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMethods((data as PaymentMethod[]) || []);
    } catch (e: any) {
      console.error("Error fetching payment methods:", e);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const resetForm = () => {
    setFormData({ method_type: "", provider_name: "", account_number: "", account_name: "", receiver_name: "", is_active: true });
    setEditingMethod(null);
  };

  const handleAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_type: method.method_type,
      provider_name: method.provider_name || "",
      account_number: method.account_number,
      account_name: method.account_name,
      receiver_name: method.receiver_name || "",
      is_active: method.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!merchantId) return;
    if (!formData.method_type || !formData.account_number.trim() || !formData.account_name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if ((formData.method_type === "lipa_number" || formData.method_type === "mobile_money") && !formData.provider_name) {
      toast.error("Please select a provider");
      return;
    }
    if (formData.method_type === "lipa_number" && !formData.receiver_name.trim()) {
      toast.error("Please enter the pay number receiver name");
      return;
    }
    if (formData.method_type === "bank_transfer" && !formData.provider_name) {
      toast.error("Please select a bank");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        merchant_id: merchantId,
        method_type: formData.method_type,
        provider_name: formData.provider_name || null,
        account_number: formData.account_number.trim(),
        account_name: formData.account_name.trim(),
        receiver_name: formData.method_type === "lipa_number" ? formData.receiver_name.trim() : null,
        is_active: formData.is_active,
      };

      if (editingMethod) {
        const { error } = await supabase
          .from("merchant_payment_methods")
          .update(payload)
          .eq("id", editingMethod.id);
        if (error) throw error;
        toast.success("Payment method updated");
      } else {
        const { error } = await supabase
          .from("merchant_payment_methods")
          .insert(payload);
        if (error) throw error;
        toast.success("Payment method added");
      }
      setDialogOpen(false);
      resetForm();
      fetchMethods();
    } catch (e: any) {
      toast.error("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from("merchant_payment_methods")
        .update({ is_active: !method.is_active })
        .eq("id", method.id);
      if (error) throw error;
      toast.success(method.is_active ? "Payment method deactivated" : "Payment method activated");
      fetchMethods();
    } catch (e: any) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("merchant_payment_methods")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Payment method removed");
      fetchMethods();
    } catch (e: any) {
      toast.error("Failed to delete");
    }
  };

  const getProviderOptions = () => {
    switch (formData.method_type) {
      case "mobile_money": return MOBILE_PROVIDERS;
      case "bank_transfer": return BANK_PROVIDERS;
      case "lipa_number": return LIPA_PROVIDERS;
      default: return [];
    }
  };

  const getMethodIcon = (type: string) => {
    const found = METHOD_TYPES.find(m => m.value === type);
    if (!found) return CreditCard;
    return found.icon;
  };

  const getMethodLabel = (type: string) => {
    const found = METHOD_TYPES.find(m => m.value === type);
    return found?.label || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Payment Methods</h2>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
          <p className="text-muted-foreground">Loading payment methods...</p>
        </Card>
      ) : methods.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No payment methods configured yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add payment methods so customers know how to pay you.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => {
            const Icon = getMethodIcon(method.method_type);
            return (
              <Card key={method.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{getMethodLabel(method.method_type)}</h3>
                      {method.provider_name && (
                        <Badge variant="outline" className="text-xs">{method.provider_name}</Badge>
                      )}
                      <Badge variant={method.is_active ? "default" : "secondary"} className="text-xs">
                        {method.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Account: <span className="font-medium text-foreground">{method.account_number}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Name: <span className="font-medium text-foreground">{method.account_name}</span>
                    </p>
                    {method.method_type === "lipa_number" && method.receiver_name && (
                      <p className="text-sm text-muted-foreground">
                        Receiver: <span className="font-medium text-foreground">{method.receiver_name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={() => handleToggleActive(method)}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleEdit(method)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(method.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Type *</Label>
              <Select value={formData.method_type} onValueChange={(v) => setFormData(prev => ({ ...prev, method_type: v, provider_name: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {METHOD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.method_type && (
              <div>
                <Label>{formData.method_type === "bank_transfer" ? "Bank" : "Provider (Telecom/Bank)"} *</Label>
                <Select value={formData.provider_name} onValueChange={(v) => setFormData(prev => ({ ...prev, provider_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {getProviderOptions().map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>{formData.method_type === "lipa_number" ? "Pay Number (Lipa Number)" : "Account Number"} *</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder={formData.method_type === "lipa_number" ? "Enter lipa number" : "Enter account number"}
              />
            </div>

            <div>
              <Label>Account Name *</Label>
              <Input
                value={formData.account_name}
                onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                placeholder="Name on the account"
              />
            </div>

            {formData.method_type === "lipa_number" && (
              <div>
                <Label>Pay Number Receiver Name *</Label>
                <Input
                  value={formData.receiver_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiver_name: e.target.value }))}
                  placeholder="Name of the pay number receiver"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
              />
              <Label>Active (visible to customers)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {saving ? "Saving..." : editingMethod ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsTab;

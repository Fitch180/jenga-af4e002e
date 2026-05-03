
CREATE TABLE public.merchant_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  method_type TEXT NOT NULL, -- 'bank_transfer', 'mobile_money', 'lipa_number'
  provider_name TEXT, -- telecom or bank name
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  receiver_name TEXT, -- for lipa/pay numbers
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.merchant_payment_methods ENABLE ROW LEVEL SECURITY;

-- Merchants can manage their own payment methods
CREATE POLICY "Merchants can view their own payment methods"
ON public.merchant_payment_methods FOR SELECT
USING (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_payment_methods.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can insert their own payment methods"
ON public.merchant_payment_methods FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_payment_methods.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can update their own payment methods"
ON public.merchant_payment_methods FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_payment_methods.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can delete their own payment methods"
ON public.merchant_payment_methods FOR DELETE
USING (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_payment_methods.merchant_id AND mp.user_id = auth.uid()
));

-- Customers can view active payment methods of approved merchants
CREATE POLICY "Anyone can view active payment methods"
ON public.merchant_payment_methods FOR SELECT
USING (
  is_active = true AND EXISTS (
    SELECT 1 FROM merchant_profiles mp
    WHERE mp.id = merchant_payment_methods.merchant_id AND mp.approval_status = 'approved'
  )
);

-- Timestamp trigger
CREATE TRIGGER update_merchant_payment_methods_updated_at
BEFORE UPDATE ON public.merchant_payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

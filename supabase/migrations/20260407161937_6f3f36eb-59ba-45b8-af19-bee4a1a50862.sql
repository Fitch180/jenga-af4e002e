
-- Merchant reviews table
CREATE TABLE public.merchant_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  merchant_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id, user_id)
);

-- Validation trigger for rating 1-5
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_rating_trigger
BEFORE INSERT OR UPDATE ON public.merchant_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

CREATE TRIGGER update_merchant_reviews_updated_at
BEFORE UPDATE ON public.merchant_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.merchant_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.merchant_reviews FOR SELECT USING (true);

-- Users can create reviews for their own orders
CREATE POLICY "Users can create their own reviews"
ON public.merchant_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.merchant_reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Merchants can update reviews (to add response)
CREATE POLICY "Merchants can respond to reviews"
ON public.merchant_reviews FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_reviews.merchant_id AND mp.user_id = auth.uid()
));

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.merchant_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast merchant lookups
CREATE INDEX idx_merchant_reviews_merchant_id ON public.merchant_reviews(merchant_id);
CREATE INDEX idx_merchant_reviews_order_id ON public.merchant_reviews(order_id);

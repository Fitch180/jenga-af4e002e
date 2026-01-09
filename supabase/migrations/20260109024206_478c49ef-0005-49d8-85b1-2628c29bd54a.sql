-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  related_type TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system to create notifications (via service role)
CREATE POLICY "Service can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to create order status notification
CREATE OR REPLACE FUNCTION public.create_order_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only trigger on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Order Confirmed';
        notification_message := 'Your order has been confirmed by the merchant.';
      WHEN 'processing' THEN
        notification_title := 'Order Processing';
        notification_message := 'Your order is being prepared.';
      WHEN 'shipped' THEN
        notification_title := 'Order Shipped';
        notification_message := 'Your order is on its way!';
      WHEN 'delivered' THEN
        notification_title := 'Order Delivered';
        notification_message := 'Your order has been delivered successfully.';
      WHEN 'cancelled' THEN
        notification_title := 'Order Cancelled';
        notification_message := 'Your order has been cancelled.';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
    VALUES (NEW.user_id, notification_title, notification_message, 'order', 'order', NEW.id);
  END IF;

  -- Notify on delivery fee update
  IF OLD.delivery_fee IS DISTINCT FROM NEW.delivery_fee AND NEW.delivery_fee > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
    VALUES (NEW.user_id, 'Delivery Fee Set', 'The merchant has set a delivery fee of ' || NEW.delivery_fee || ' Tsh for your order.', 'order', 'order', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for order status notifications
CREATE TRIGGER order_status_notification
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_order_status_notification();

-- Create function for quotation status notification
CREATE OR REPLACE FUNCTION public.create_quotation_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only trigger on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'quoted' THEN
        notification_title := 'Quotation Received';
        notification_message := 'The merchant has responded to your quotation request.';
      WHEN 'accepted' THEN
        notification_title := 'Quotation Accepted';
        notification_message := 'Your quotation has been accepted!';
      WHEN 'rejected' THEN
        notification_title := 'Quotation Rejected';
        notification_message := 'Unfortunately, your quotation was rejected.';
      WHEN 'expired' THEN
        notification_title := 'Quotation Expired';
        notification_message := 'Your quotation has expired.';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
    VALUES (NEW.user_id, notification_title, notification_message, 'quotation', 'quotation', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for quotation status notifications
CREATE TRIGGER quotation_status_notification
AFTER UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.create_quotation_status_notification();
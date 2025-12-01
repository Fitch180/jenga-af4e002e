-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id INTEGER NOT NULL,
  merchant_name TEXT NOT NULL,
  merchant_image TEXT,
  last_message TEXT,
  unread BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, merchant_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'merchant')),
  sender_id UUID NOT NULL,
  text TEXT,
  image_url TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Function to update conversation's last_message and updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message = COALESCE(NEW.text, 
      CASE 
        WHEN NEW.image_url IS NOT NULL THEN 'Image'
        WHEN NEW.document_url IS NOT NULL THEN 'Document'
        ELSE 'Message'
      END
    ),
    updated_at = NEW.created_at,
    unread = CASE WHEN NEW.sender_type = 'merchant' THEN true ELSE unread END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update conversation when message is added
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-documents', 'chat-documents', true);

-- Storage policies for chat-images
CREATE POLICY "Users can upload their own chat images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view chat images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

-- Storage policies for chat-documents
CREATE POLICY "Users can upload their own chat documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view chat documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-documents');

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
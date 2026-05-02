import { useState, useRef } from "react";
import { Star, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewFormProps {
  onSubmit: (rating: number, reviewText: string, photoUrls?: string[]) => Promise<boolean>;
}

export const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const newFiles = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newFiles]);
    if (e.target) e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const photo of photos) {
      const ext = photo.file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("review-images").upload(path, photo.file);
      if (error) { toast.error("Failed to upload photo"); continue; }
      const { data } = supabase.storage.from("review-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    let photoUrls: string[] = [];
    if (photos.length > 0) {
      photoUrls = await uploadPhotos();
    }
    const success = await onSubmit(rating, reviewText, photoUrls);
    if (success) {
      setRating(0);
      setReviewText("");
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
    }
    setSubmitting(false);
  };

  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-semibold text-foreground">Leave a Review</h4>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience (optional)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
        rows={3}
        className="resize-none"
      />
      
      {/* Photo Upload */}
      <div className="space-y-2">
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden">
                <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Camera className="w-3 h-3 mr-1" />
            Add Photo ({photos.length}/3)
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </Card>
  );
};

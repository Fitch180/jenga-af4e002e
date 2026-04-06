import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, NotebookPen, Trash2, Edit2, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: "activity" | "wish" | "cost";
  amount?: number;
  createdAt: Date;
}

const Journal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"activity" | "wish" | "cost">("activity");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading journal:", error);
      } else {
        setEntries(data.map(row => ({
          id: row.id,
          title: row.title,
          content: row.content || "",
          category: row.category as "activity" | "wish" | "cost",
          amount: row.amount ? Number(row.amount) : undefined,
          createdAt: new Date(row.created_at),
        })));
      }
      setLoading(false);
    };

    load();
  }, [userId]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!userId) {
      toast.error("Please log in to save journal entries");
      return;
    }

    if (editingEntry) {
      const { error } = await supabase
        .from("journal_entries")
        .update({
          title,
          content,
          category,
          amount: amount ? parseFloat(amount) : null,
        })
        .eq("id", editingEntry.id)
        .eq("user_id", userId);

      if (error) {
        toast.error("Failed to update entry");
      } else {
        setEntries(prev => prev.map(e =>
          e.id === editingEntry.id
            ? { ...e, title, content, category, amount: amount ? parseFloat(amount) : undefined }
            : e
        ));
        toast.success("Entry updated");
      }
    } else {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title,
          content,
          category,
          amount: amount ? parseFloat(amount) : null,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to add entry");
      } else {
        setEntries(prev => [{
          id: data.id,
          title: data.title,
          content: data.content || "",
          category: data.category as "activity" | "wish" | "cost",
          amount: data.amount ? Number(data.amount) : undefined,
          createdAt: new Date(data.created_at),
        }, ...prev]);
        toast.success("Entry added");
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to delete entry");
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Entry deleted");
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setAmount(entry.amount?.toString() || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("activity");
    setAmount("");
    setEditingEntry(null);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "activity": return "bg-blue-500/20 text-blue-700";
      case "wish": return "bg-purple-500/20 text-purple-700";
      case "cost": return "bg-green-500/20 text-green-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "activity": return "Activity";
      case "wish": return "Building Wish";
      case "cost": return "Cost";
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">My Journal</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Plus className="w-4 h-4 mr-1" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="flex gap-2">
                  {(["activity", "wish", "cost"] as const).map((cat) => (
                    <Button key={cat} type="button" size="sm" variant={category === cat ? "default" : "outline"} onClick={() => setCategory(cat)}>
                      {getCategoryLabel(cat)}
                    </Button>
                  ))}
                </div>
                {category === "cost" && (
                  <Input type="number" placeholder="Amount (TZS)" value={amount} onChange={(e) => setAmount(e.target.value)} />
                )}
                <Textarea placeholder="Write your notes here..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
                <Button onClick={handleSave} className="w-full">
                  {editingEntry ? "Update" : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {entries.some((e) => e.category === "cost" && e.amount) && (
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Costs</p>
                    <p className="text-2xl font-bold text-green-600">
                      TZS {entries.filter(e => e.category === "cost" && e.amount).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {entries.filter(e => e.category === "cost").length} cost entries
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center text-center">
              <NotebookPen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start recording your building activities, wishes, and costs
              </p>
            </div>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(entry.category)}`}>
                        {getCategoryLabel(entry.category)}
                      </span>
                      {entry.amount && (
                        <span className="text-sm font-semibold text-green-600">
                          TZS {entry.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {entry.content && (
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default Journal;

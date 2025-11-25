import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (products: any[]) => void;
}

const BulkUploadDialog = ({ open, onOpenChange, onUpload }: BulkUploadDialogProps) => {
  const [csvData, setCsvData] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  const sampleCSV = `name,price,category,description,image
Ceramic Tiles,50000,TILES,Premium ceramic tiles,https://example.com/image.jpg
Wall Paint,35000,PAINTING,Interior paint,`;

  const parseCSV = (csv: string) => {
    setError("");
    setPreview([]);

    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV must have a header row and at least one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["name", "price", "category"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      setError(`Missing required columns: ${missingHeaders.join(", ")}`);
      return;
    }

    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < headers.length) continue;

      const product: any = {};
      headers.forEach((header, index) => {
        product[header] = values[index] || "";
      });

      if (product.name && product.price && product.category) {
        const priceNum = parseInt(product.price.replace(/,/g, ""));
        product.price = `${priceNum.toLocaleString()} Tsh`;
        product.image = product.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop";
        products.push(product);
      }
    }

    if (products.length === 0) {
      setError("No valid products found in CSV");
      return;
    }

    setPreview(products);
  };

  const handleUpload = () => {
    if (preview.length > 0) {
      onUpload(preview);
      setCsvData("");
      setPreview([]);
      onOpenChange(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvData(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload CSV file or drag and drop
                </p>
              </label>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste CSV data</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value);
                if (e.target.value) parseCSV(e.target.value);
              }}
              placeholder={sampleCSV}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground mb-1">CSV Format:</p>
            <p className="text-xs text-muted-foreground">
              Required columns: <span className="font-medium">name, price, category</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Optional columns: description, image
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {preview.length} products ready to upload
                </AlertDescription>
              </Alert>
              
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-foreground">Name</th>
                      <th className="px-3 py-2 text-left text-foreground">Price</th>
                      <th className="px-3 py-2 text-left text-foreground">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 text-foreground">{p.name}</td>
                        <td className="px-3 py-2 text-foreground">{p.price}</td>
                        <td className="px-3 py-2 text-foreground">{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={preview.length === 0}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Upload {preview.length > 0 && `(${preview.length})`} Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { Upload, FileText, Image } from "lucide-react";

interface PendingResult {
  _id: string;
  patient: {
    name: string;
    email: string;
    phone: string;
  };
  center: {
    name: string;
  };
  test: {
    name: string;
    category: string;
  };
  appointmentDate: string;
  totalAmount: number;
  completedAt: string;
}

const AdminPendingResults = () => {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PendingResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingResults();
  }, []);

  const fetchPendingResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pending-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingResults(data.pendingResults);
      } else {
        toast({
          title: "Error",
          description: "Failed to load pending results",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, PNG, JPG, or JPEG file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadResults = async () => {
    if (!selectedAppointment || !file) {
      toast({
        title: "Missing Information",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('summary', summary);
      formData.append('appointmentId', selectedAppointment._id);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/upload-results', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Results Uploaded",
          description: "Test results have been uploaded successfully",
        });
        setDialogOpen(false);
        setFile(null);
        setSummary("");
        setSelectedAppointment(null);
        fetchPendingResults();
      } else {
        const errorData = await response.json();
        toast({
          title: "Upload Failed",
          description: errorData.message || "Failed to upload results",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload results",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Pending Results</h1>

        <Card>
          <CardHeader>
            <CardTitle>Tests Awaiting Results</CardTitle>
            <CardDescription>Upload results for completed tests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingResults.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.patient.name}</p>
                        <p className="text-sm text-muted-foreground">{result.patient.email}</p>
                        <p className="text-sm text-muted-foreground">{result.patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.test.name}</p>
                        <p className="text-sm text-muted-foreground">{result.test.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{result.center.name}</TableCell>
                    <TableCell>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{result.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedAppointment(result)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Results
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Upload Test Results</DialogTitle>
                            <DialogDescription>
                              Upload results for {selectedAppointment?.patient.name} - {selectedAppointment?.test.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="file">Result File (PDF or Image)</Label>
                              <Input
                                id="file"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                                className="mt-1"
                              />
                              {file && (
                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                  {file.type === 'application/pdf' ? (
                                    <FileText className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Image className="h-4 w-4 mr-1" />
                                  )}
                                  {file.name}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="summary">Summary (Optional)</Label>
                              <Textarea
                                id="summary"
                                placeholder="Enter a brief summary of the test results..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              onClick={uploadResults}
                              disabled={!file || uploadLoading}
                              className="w-full"
                            >
                              {uploadLoading ? "Uploading..." : "Upload Results"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pendingResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending results to upload
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPendingResults;

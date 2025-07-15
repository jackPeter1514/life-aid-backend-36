
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { Search } from "lucide-react";

interface TestHistory {
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
  status: string;
  totalAmount: number;
  results?: {
    reportUrl?: string;
    summary?: string;
    uploadedAt?: string;
  };
  completedAt?: string;
}

const AdminTestHistory = () => {
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTestHistory();
  }, []);

  useEffect(() => {
    const filtered = history.filter(item =>
      item.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.test.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  const fetchTestHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/test-history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setFilteredHistory(data.history);
      } else {
        toast({
          title: "Error",
          description: "Failed to load test history",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load test history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-8">Test History</h1>

        <Card>
          <CardHeader>
            <CardTitle>Customer Test History</CardTitle>
            <CardDescription>View all completed and ongoing tests</CardDescription>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, email, or test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Test Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.patient.name}</p>
                        <p className="text-sm text-muted-foreground">{item.patient.email}</p>
                        <p className="text-sm text-muted-foreground">{item.patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.test.name}</p>
                        <p className="text-sm text-muted-foreground">{item.test.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.center.name}</TableCell>
                    <TableCell>
                      {new Date(item.appointmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'completed' ? 'default' :
                        item.status === 'confirmed' ? 'secondary' :
                        'outline'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{item.totalAmount}</TableCell>
                    <TableCell>
                      {item.results?.reportUrl ? (
                        <a
                          href={item.results.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Report
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No results yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTestHistory;

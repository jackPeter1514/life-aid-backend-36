
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface CustomerRequest {
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
  appointmentTime: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const AdminCustomerRequests = () => {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomerRequests();
  }, []);

  const fetchCustomerRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/customer-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        toast({
          title: "Error",
          description: "Failed to load customer requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customer-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Request Approved",
          description: "Customer request has been approved successfully",
        });
        fetchCustomerRequests();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customer-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "Customer request has been rejected",
        });
        fetchCustomerRequests();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
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
        <h1 className="text-3xl font-bold mb-8">Customer Requests</h1>

        <Card>
          <CardHeader>
            <CardTitle>Pending Appointment Requests</CardTitle>
            <CardDescription>Review and approve customer appointment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.patient.name}</p>
                        <p className="text-sm text-muted-foreground">{request.patient.email}</p>
                        <p className="text-sm text-muted-foreground">{request.patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.test.name}</p>
                        <p className="text-sm text-muted-foreground">{request.test.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.center.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(request.appointmentDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{request.appointmentTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{request.totalAmount}</TableCell>
                    <TableCell>
                      <Badge variant={
                        request.status === 'confirmed' ? 'default' :
                        request.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
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

export default AdminCustomerRequests;

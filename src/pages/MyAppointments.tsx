import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Phone, Mail, TestTube, CreditCard, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface DiagnosticCenter {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
}

interface Appointment {
  _id: string;
  patientId: User;
  diagnosticCenterId: DiagnosticCenter;
  testId: DiagnosticTest;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  results?: {
    reportUrl?: string;
    summary?: string;
    uploadedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAppointments(token);
  }, [navigate]);

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch('/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Network error while fetching appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-purple-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'refunded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-primary">My Appointments</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any appointments yet.
              </p>
              <Link to="/appointments/book">
                <Button>Book Your First Appointment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <Card key={appointment._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        {appointment.testId.name}
                      </CardTitle>
                      <CardDescription>
                        {appointment.testId.category} • Duration: {appointment.testId.duration}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                        {appointment.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Date and Time */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(appointment.appointmentTime)}</span>
                    </div>
                  </div>

                  {/* Diagnostic Center Info */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {appointment.diagnosticCenterId.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {appointment.diagnosticCenterId.address}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {appointment.diagnosticCenterId.phone}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Total Amount</span>
                    </div>
                    <span className="font-bold text-lg">₹{appointment.totalAmount}</span>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-800">Notes</h5>
                          <p className="text-sm text-blue-700">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {appointment.cancellationReason && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-800">Cancellation Reason</h5>
                          <p className="text-sm text-red-700">{appointment.cancellationReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results (if available) */}
                  {appointment.results && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Test Results Available</h5>
                      {appointment.results.summary && (
                        <p className="text-sm text-green-700 mb-2">{appointment.results.summary}</p>
                      )}
                      {appointment.results.reportUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={appointment.results.reportUrl} target="_blank" rel="noopener noreferrer">
                            Download Report
                          </a>
                        </Button>
                      )}
                      {appointment.results.uploadedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Uploaded: {new Date(appointment.results.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Booked: {new Date(appointment.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(appointment.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Clock, MapPin, TestTube, User, Phone, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";

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
  preparation?: string;
}

interface BookingData {
  center: DiagnosticCenter | null;
  test: DiagnosticTest | null;
  date: Date | null;
  time: string;
  notes: string;
}

// Real Indian Diagnostic Centers
const indianDiagnosticCenters: DiagnosticCenter[] = [
  {
    _id: "center_1",
    name: "Apollo Diagnostics",
    address: "Apollo Hospital, MG Road, Bangalore, Karnataka",
    phone: "+91-80-2692-2222"
  },
  {
    _id: "center_2", 
    name: "Dr. Lal PathLabs",
    address: "Lal Path Labs, Connaught Place, New Delhi",
    phone: "+91-11-4940-0400"
  },
  {
    _id: "center_3",
    name: "SRL Diagnostics",
    address: "SRL Limited, Sector 44, Gurgaon, Haryana", 
    phone: "+91-124-491-1111"
  },
  {
    _id: "center_4",
    name: "Metropolis Healthcare",
    address: "Metropolis House, Bandra East, Mumbai, Maharashtra",
    phone: "+91-22-3090-2222"
  },
  {
    _id: "center_5",
    name: "Thyrocare Technologies",
    address: "Thyrocare House, Navi Mumbai, Maharashtra",
    phone: "+91-22-3090-9900"
  },
  {
    _id: "center_6",
    name: "Vijaya Diagnostic Centre",
    address: "Vijaya Health Centre, Secunderabad, Telangana",
    phone: "+91-40-4455-6666"
  },
  {
    _id: "center_7",
    name: "Suburban Diagnostics",
    address: "Suburban Diagnostics, Andheri West, Mumbai, Maharashtra",
    phone: "+91-22-2674-3000"
  },
  {
    _id: "center_8",
    name: "Quest Diagnostics",
    address: "Quest Lab, Anna Nagar, Chennai, Tamil Nadu",
    phone: "+91-44-4200-8888"
  },
  {
    _id: "center_9",
    name: "Ganesh Diagnostic Centre",
    address: "Ganesh Diagnostic, Rajouri Garden, New Delhi",
    phone: "+91-11-2570-5000"
  },
  {
    _id: "center_10",
    name: "Redcliffe Labs",
    address: "Redcliffe Diagnostics, Sector 63, Noida, Uttar Pradesh",
    phone: "+91-120-456-7890"
  }
];

// Real Diagnostic Tests
const indianDiagnosticTests: DiagnosticTest[] = [
  // Blood Tests
  {
    _id: "test_1",
    name: "Complete Blood Count (CBC)",
    category: "blood_test",
    price: 350,
    duration: "30 minutes",
    preparation: "No fasting required"
  },
  {
    _id: "test_2", 
    name: "Lipid Profile",
    category: "blood_test",
    price: 800,
    duration: "30 minutes",
    preparation: "12 hours fasting required"
  },
  {
    _id: "test_3",
    name: "Liver Function Test (LFT)",
    category: "blood_test", 
    price: 650,
    duration: "30 minutes",
    preparation: "8 hours fasting required"
  },
  {
    _id: "test_4",
    name: "Kidney Function Test (KFT)",
    category: "blood_test",
    price: 700,
    duration: "30 minutes", 
    preparation: "No fasting required"
  },
  {
    _id: "test_5",
    name: "Thyroid Profile (T3, T4, TSH)",
    category: "blood_test",
    price: 900,
    duration: "30 minutes",
    preparation: "No fasting required"
  },
  // Medical Imaging
  {
    _id: "test_6",
    name: "Chest X-Ray",
    category: "imaging",
    price: 500,
    duration: "15 minutes",
    preparation: "Remove metal objects"
  },
  {
    _id: "test_7",
    name: "Abdominal Ultrasound",
    category: "imaging", 
    price: 1200,
    duration: "45 minutes",
    preparation: "6 hours fasting, drink water 1 hour before"
  },
  {
    _id: "test_8",
    name: "MRI Brain Scan",
    category: "imaging",
    price: 5500,
    duration: "60 minutes",
    preparation: "Remove all metal objects"
  },
  {
    _id: "test_9",
    name: "CT Scan Abdomen",
    category: "imaging",
    price: 3200,
    duration: "30 minutes", 
    preparation: "4 hours fasting required"
  },
  // Cardiology
  {
    _id: "test_10",
    name: "ECG (Electrocardiogram)",
    category: "cardiology",
    price: 300,
    duration: "15 minutes",
    preparation: "No special preparation"
  },
  {
    _id: "test_11",
    name: "2D Echo Cardiography", 
    category: "cardiology",
    price: 1800,
    duration: "45 minutes",
    preparation: "No special preparation"
  },
  {
    _id: "test_12",
    name: "Stress Test (TMT)",
    category: "cardiology",
    price: 2200,
    duration: "60 minutes",
    preparation: "Wear comfortable clothes and shoes"
  },
  // General Health
  {
    _id: "test_13",
    name: "Master Health Checkup",
    category: "general",
    price: 2500,
    duration: "3 hours",
    preparation: "12 hours fasting required"
  },
  {
    _id: "test_14",
    name: "Executive Health Package",
    category: "general", 
    price: 4500,
    duration: "4 hours",
    preparation: "12 hours fasting required"
  },
  // Women's Health
  {
    _id: "test_15",
    name: "Pap Smear Test",
    category: "women_health",
    price: 800,
    duration: "20 minutes",
    preparation: "Avoid intercourse 24 hours before"
  },
  {
    _id: "test_16",
    name: "Mammography",
    category: "women_health",
    price: 2000,
    duration: "30 minutes",
    preparation: "Avoid deodorant/powder on test day"
  },
  {
    _id: "test_17",
    name: "PCOS Profile",
    category: "women_health",
    price: 1500,
    duration: "30 minutes",
    preparation: "Best done on day 2-5 of menstrual cycle"
  },
  // Diabetes
  {
    _id: "test_18",
    name: "HbA1c (Glycated Hemoglobin)",
    category: "diabetes",
    price: 550,
    duration: "30 minutes", 
    preparation: "No fasting required"
  },
  {
    _id: "test_19",
    name: "Glucose Tolerance Test (GTT)",
    category: "diabetes",
    price: 450,
    duration: "3 hours",
    preparation: "12 hours fasting, bring glucose solution"
  },
  {
    _id: "test_20",
    name: "Diabetes Package",
    category: "diabetes",
    price: 1200,
    duration: "45 minutes",
    preparation: "12 hours fasting required"
  }
];

const testCategories = [
  { value: "blood_test", label: "Blood Tests", icon: "🩸" },
  { value: "imaging", label: "Medical Imaging", icon: "📷" },
  { value: "cardiology", label: "Cardiology", icon: "❤️" },
  { value: "general", label: "General Health", icon: "🏥" },
  { value: "women_health", label: "Women's Health", icon: "👩‍⚕️" },
  { value: "diabetes", label: "Diabetes", icon: "🩺" },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Simple booking storage (in a real app, this would be in a database)
const getBookingKey = (centerId: string, date: string, time: string) => 
  `booking_${centerId}_${date}_${time}`;

const getStoredBookings = (): string[] => {
  const stored = localStorage.getItem('diagnostic_bookings');
  return stored ? JSON.parse(stored) : [];
};

const addBooking = (centerId: string, date: string, time: string) => {
  const bookings = getStoredBookings();
  const bookingKey = getBookingKey(centerId, date, time);
  if (!bookings.includes(bookingKey)) {
    bookings.push(bookingKey);
    localStorage.setItem('diagnostic_bookings', JSON.stringify(bookings));
  }
};

const getBookedSlots = (centerId: string, date: string): string[] => {
  const bookings = getStoredBookings();
  const prefix = `booking_${centerId}_${date}_`;
  return bookings
    .filter(booking => booking.startsWith(prefix))
    .map(booking => booking.replace(prefix, ''));
};

const BookAppointment = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [allTests, setAllTests] = useState<DiagnosticTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<DiagnosticTest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    center: null,
    test: null,
    date: null,
    time: "",
    notes: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
    fetchAllTests();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allTests.filter(test => 
        test.category.toLowerCase() === selectedCategory.toLowerCase() ||
        test.category.toLowerCase().replace('_', ' ') === selectedCategory.toLowerCase().replace('_', ' ')
      );
      setFilteredTests(filtered);
    } else {
      setFilteredTests([]);
    }
    setSelectedTest("");
  }, [selectedCategory, allTests]);

  useEffect(() => {
    if (selectedCenter && date) {
      fetchAvailableSlots();
    }
  }, [selectedCenter, date]);

  const fetchCenters = async () => {
    // Use local Indian diagnostic centers data
    setCenters(indianDiagnosticCenters);
  };

  const fetchAllTests = async () => {
    // Use local Indian diagnostic tests data
    setAllTests(indianDiagnosticTests);
  };

  const fetchAvailableSlots = () => {
    if (!selectedCenter || !date) return;
    
    const formattedDate = date.toISOString().split('T')[0];
    const bookedSlots = getBookedSlots(selectedCenter, formattedDate);
    const available = timeSlots.filter(slot => !bookedSlots.includes(slot));
    setAvailableSlots(available);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCenter || !selectedTest || !date || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const centerData = centers.find(c => c._id === selectedCenter);
    const testData = filteredTests.find(t => t._id === selectedTest);

    if (!centerData || !testData) {
      toast({
        title: "Error",
        description: "Selected center or test not found",
        variant: "destructive",
      });
      return;
    }

    setBookingData({
      center: centerData,
      test: testData,
      date: date,
      time: selectedTime,
      notes: notes
    });
    setShowConfirmDialog(true);
  };

  const confirmBooking = async () => {
    if (!date || !selectedCenter || !selectedTime) return;
    
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const formattedDate = date.toISOString().split('T')[0];
      
      // Check if slot is still available (in case someone else booked it)
      const currentBookedSlots = getBookedSlots(selectedCenter, formattedDate);
      if (currentBookedSlots.includes(selectedTime)) {
        toast({
          title: "Booking Failed",
          description: "This time slot has been taken by another user. Please select a different time.",
          variant: "destructive",
        });
        setShowConfirmDialog(false);
        fetchAvailableSlots(); // Refresh available slots
        setSelectedTime(""); // Clear selected time
        return;
      }

      // Book the appointment locally
      addBooking(selectedCenter, formattedDate, selectedTime);

      // Store appointment details for the appointments page
      const appointmentData = {
        id: `appt_${Date.now()}`,
        center: bookingData.center,
        test: bookingData.test,
        date: formattedDate,
        time: selectedTime,
        notes: notes.trim(),
        status: 'confirmed',
        bookedAt: new Date().toISOString()
      };

      // Get existing appointments and add new one
      const existingAppointments = JSON.parse(localStorage.getItem('user_appointments') || '[]');
      existingAppointments.push(appointmentData);
      localStorage.setItem('user_appointments', JSON.stringify(existingAppointments));

      toast({
        title: "Appointment Confirmed! 🎉",
        description: `Your appointment at ${bookingData.center?.name} has been successfully booked for ${format(date, "MMM do, yyyy")} at ${selectedTime}.`,
      });
      
      setShowConfirmDialog(false);
      
      // Reset form after successful booking
      setSelectedCenter("");
      setSelectedTest("");
      setSelectedCategory("");
      setDate(undefined);
      setSelectedTime("");
      setNotes("");
      setAvailableSlots([]);
      
      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "Something went wrong while booking your appointment. Please try again.",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedCenterData = centers.find(c => c._id === selectedCenter);
  const selectedTestData = filteredTests.find(t => t._id === selectedTest);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6 text-primary" />
                Book Diagnostic Appointment
              </CardTitle>
              <CardDescription>
                Schedule your diagnostic test with ease. Select your preferred center, test, and time slot.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleFormSubmit}>
              <CardContent className="space-y-8">
                {/* Test Category Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Test Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {testCategories.map((category) => (
                      <Button
                        key={category.value}
                        type="button"
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        className="h-auto p-3 justify-start"
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        <span className="mr-2 text-lg">{category.icon}</span>
                        <span className="text-sm">{category.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Center Selection */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Diagnostic Center *</Label>
                  <Select onValueChange={setSelectedCenter} value={selectedCenter}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose your preferred diagnostic center" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {centers.map((center) => (
                        <SelectItem key={center._id} value={center._id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{center.name}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {center.address}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Selection */}
                {selectedCategory && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Diagnostic Test *</Label>
                    <Select onValueChange={setSelectedTest} value={selectedTest}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select the specific test you need" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        {filteredTests.map((test) => (
                          <SelectItem key={test._id} value={test._id}>
                            <div className="flex flex-col items-start w-full">
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{test.name}</span>
                                <Badge variant="secondary" className="ml-2">
                                  ₹{test.price}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Duration: {test.duration} • Category: {test.category}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Appointment Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "EEEE, MMMM do, yyyy") : "Select your appointment date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">
                    Note: Appointments are not available on Sundays
                  </p>
                </div>

                {/* Time Slot Selection */}
                {selectedCenter && date && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Available Time Slots *</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          className="h-10"
                          onClick={() => setSelectedTime(slot)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                        No available slots for this date. Please try a different date.
                      </p>
                    )}
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-semibold">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, medical conditions, or instructions for the test..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Summary Card */}
                {selectedCenterData && selectedTestData && date && selectedTime && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Appointment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedCenterData.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTestData.name}</span>
                        <Badge>{selectedTestData.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{format(date, "EEEE, MMMM do, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">₹{selectedTestData.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={!selectedCenter || !selectedTest || !date || !selectedTime}
                >
                  Proceed to Confirm Appointment
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Confirm Your Appointment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <div className="space-y-2">
                <p><strong>Center:</strong> {bookingData.center?.name}</p>
                <p><strong>Test:</strong> {bookingData.test?.name}</p>
                <p><strong>Date:</strong> {bookingData.date ? format(bookingData.date, "EEEE, MMMM do, yyyy") : ""}</p>
                <p><strong>Time:</strong> {bookingData.time}</p>
                <p><strong>Amount:</strong> ₹{bookingData.test?.price}</p>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                Once confirmed, this time slot will be reserved for you. Please arrive 15 minutes before your appointment.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmBooking} disabled={loading}>
              {loading ? "Booking..." : "Confirm & Book"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookAppointment;

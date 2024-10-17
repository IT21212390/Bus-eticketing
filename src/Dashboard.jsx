import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select} from './components/ui/select';
import { Bus, CreditCard } from 'lucide-react';
import { AlertDialog, AlertDialogAction,AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alertdialog';
import { useToast } from './components/ui/toast';
import emailjs from '@emailjs/browser';
import BusTracker from './components/ui/Bustracker';


const BusETicketingSystem = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [seats, setSeats] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [Email, setEmail] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchRoutes = async () => {
      const mockRoutes = [
        { id: 1, name: 'Colombo - Kandy', type: 'Private', startTime: '08:00 AM', endTime: '12:30 PM', availableSeats: 40 },
        { id: 2, name: 'Galle - Jaffna', type: 'Private', startTime: '09:15 AM', endTime: '5.00 PM', availableSeats: 25 },
        { id: 3, name: 'Katharagama - Jaffna', type: 'CTB', startTime: '8:00 AM', endTime: '6.00 PM', availableSeats: 35 },
        { id: 4, name: 'Colombo - Vauniya', type: 'CTB', startTime: '10:30 AM', endTime: '5.30 PM', availableSeats: 45 },
        { id: 5, name: 'Colombo - Trincomalee', type: 'Private', startTime: '8:30 AM', endTime: '4:00 PM', availableSeats: 55 },
      ];
      setRoutes(mockRoutes);
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const initializeEmailJS = async () => {
      try {
        await emailjs.init(process.env.REACT_APP_EMAIL_PUBLIC_KEY);
        console.log("EmailJS initialized successfully");
      } catch (error) {
        console.error("EmailJS initialization error:", error);
      }
    };
    
    initializeEmailJS();
  }, []);

  const sendConfirmationEmail = async () => {
    if (!Email || !selectedRoute) {
      addToast('Invalid email or route selection', 'error');
      return false;
    }

    const templateParams = {
      to_name: cardName,
      to_email: Email,
      from_name: "E-BUS Ticketing Team",
      booking_reference: `BG${Date.now()}`,
      route_name: selectedRoute.name,
      seats: seats,
      total_amount: seats * 10,
      departure_time: selectedRoute.startTime,
      arrival_time: selectedRoute.endTime,
      card_number: cardNumber ? `****${cardNumber.slice(-4)}` : '',
      cardholder_name: cardName
    };

    try {
      const response = await emailjs.send(
        process.env.REACT_APP_EMAIL_SERVICE_ID,
        process.env.REACT_APP_EMAIL_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAIL_PUBLIC_KEY
      );

      if (response.status === 200) {
        //addToast('Confirmation email sent successfully!', 'success');
        return true;
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      addToast('Failed to send confirmation email', 'error');
      return false;
    }
  };

  const handleRouteSelect = (routeId) => {
    const route = routes.find(r => r.id === parseInt(routeId));
    setSelectedRoute(route);
    setSeats(1);
  };

  const handleBookTicket = () => {
    if (!selectedRoute) return;
    setIsPaymentOpen(true);
  };

  const validatePaymentDetails = () => {
    // Basic validation rules
    //const isCardNumberValid = cardNumber.length >= 16 && cardNumber.length <= 19;
    const isCardNameValid = cardName.trim().length > 0;
    const isExpiryValid = cardExpiry.length === 4;
    const isCVVValid = cardCVV.length === 3;
    //const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email);

    return {
      isValid: isCardNameValid && isExpiryValid && isCVVValid,
      errors: {
        //cardNumber: !isCardNumberValid,
        cardName: !isCardNameValid,
        cardExpiry: !isExpiryValid,
        cvv: !isCVVValid,
        //email: !isEmailValid
      }
    };
  };

  const processPayment = async () => {
    // Simulating payment process
    const validation = validatePaymentDetails();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const emailSent = await sendConfirmationEmail();

    if (emailSent) {
    
    setRoutes(prevRoutes => 
      prevRoutes.map(route => 
        route.id === selectedRoute.id 
          ? { ...route, availableSeats: route.availableSeats - seats }
          : route
      )
    );
    
    setSelectedRoute(prevRoute => ({
      ...prevRoute,
      availableSeats: prevRoute.availableSeats - seats
    }));

    if (!validation.isValid) {
      addToast('Please fill in all payment details correctly.', 'error');
      return;
    }

    setIsPaymentOpen(false);
    addToast('Payment Successful! Your ticket has been booked.', 'success');
    addToast('Confirmation email sent.', 'success');

    // //alert(`Successfully booked ${seats} seat(s) for ${selectedRoute.name}`);
    // addToast('Payment Successful! Your ticket has been booked.', 'success');
    // addToast('Please fill in all payment details correctly.', 'error');
    
    // Reset card details
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCVV('');
    setEmail('');
  }  
  };

  return (
    
    <div className="container mx-auto p-4">
      {/* <nav className="bg-black text-white p-4"></nav>
      <div className="flex items-center">
            <Bus className="w-8 h-8 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold">BusGo E-Ticketing</h1>
          </div>
          <div className="flex items-center">
            <p className="mr-4">Book Your Journey with Ease!</p>
          </div> */}
      <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Bus className="w-12 h-12 text-blue-500 mr-4" />
        <h1 className="text-3xl font-bold">E-BUS Ticketing</h1>
        </div>
        <p className="text-xl">Book Your Journey with Ease!</p>
      </div> 

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Routes Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Start Time</th>
                  <th className="px-4 py-2 text-left">End Time</th>
                  <th className="px-4 py-2 text-left">Available Seats</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => (
                  <tr key={route.id} className="border-t">
                    <td className="px-4 py-2">{route.name}</td>
                    <td className="px-4 py-2">{route.type}</td>
                    <td className="px-4 py-2">{route.startTime}</td>
                    <td className="px-4 py-2">{route.endTime}</td>
                    <td className="px-4 py-2">{route.availableSeats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Book Your Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <Select
              options={routes}
              onValueChange={handleRouteSelect}
              placeholder="Select a route"
            />
          {/* <Select onValueChange={handleRouteSelect} placeholder="Select a route">
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route}>
                    {route.name}
                  </SelectItem> */}
             {/* <Select onValueChange={handleRouteSelect}>
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route} onSelect={setSelectedRoute}>
                    {route.name}
                  </SelectItem> 
                ))}
              </SelectContent>
            </Select> */}
            
            {selectedRoute && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Type:</strong> {selectedRoute.type}
                  </div>
                  <div>
                    <strong>Start Time:</strong> {selectedRoute.startTime}
                  </div>
                  <div>
                    <strong>Available Seats:</strong> {selectedRoute.availableSeats}
                  </div>
                  <div>
                    <strong>End Time:</strong> {selectedRoute.endTime}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max={selectedRoute.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.min(parseInt(e.target.value), selectedRoute.availableSeats))}
                    className="w-20"
                  />
                  <span>Seat(s)</span>
                </div>
                <Button onClick={handleBookTicket} disabled={selectedRoute.availableSeats === 0}>Book Ticket</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Route Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <BusTracker selectedRoute={selectedRoute?.name}/>
        </CardContent>
      </Card>

      <AlertDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Enter Payment Details</AlertDialogTitle>
            <AlertDialogDescription>
              You are booking {seats} seat(s) for the route: {selectedRoute?.name}
              <br />
              Total Amount: ${seats * 10}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <Input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                style={{ padding: '10px', width: '400px' }}
              />
            </div>
            <Input
              type="text"
              placeholder="Cardholder Name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
            <div className="flex space-x-2"> 
              <Input
                type="number"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => {
                  if (e.target.value.length <= 4) {
                    setCardExpiry(e.target.value);
                  }
                }}
              />
              <Input
                type="number"
                placeholder="CVV"
                value={cardCVV}
                onChange={(e) => {
                  if (e.target.value.length <= 3) {
                    setCardCVV(e.target.value);
                  }
                }}
                style={{width: '80px' }}
              />
            </div> 
            <Input
              type="text"
              placeholder="E-mail Address"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '10px', width: '400px' }}
            />
          </div>
          <AlertDialogFooter>
          <div className="flex space-x-4">
          <AlertDialogCancel onClick={() => setIsPaymentOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={processPayment}>Pay Now</AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
    
  );
};

export default BusETicketingSystem;

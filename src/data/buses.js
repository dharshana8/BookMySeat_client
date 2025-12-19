export const COUPONS = [
  { code: "FIRST10", discount: 10, type: "percentage", minAmount: 200, description: "10% off on first booking" },
  { code: "SAVE50", discount: 50, type: "fixed", minAmount: 300, description: "₹50 off on bookings above ₹300" },
  { code: "WEEKEND20", discount: 20, type: "percentage", minAmount: 400, description: "20% off on weekend bookings" }
];

// Generate buses for the next 7 days
function generateDailyBuses() {
  const buses = [];
  const today = new Date();

  const defaultRoutes = [
    {
      id: "BUS-001",
      name: "Express Travels",
      from: "Chennai",
      to: "Bangalore",
      departureTime: "06:00",
      arrivalTime: "12:00",
      fare: 450,
      totalSeats: 35,
      availableSeats: 28,
      type: "AC Sleeper",
      rating: 4.2,
      operator: "Express Travels",
      busNumber: "TN01AB1234",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Water Bottle"]
    },
    {
      id: "BUS-002",
      name: "Royal Express",
      from: "Mumbai",
      to: "Pune",
      departureTime: "22:00",
      arrivalTime: "02:00",
      fare: 380,
      totalSeats: 40,
      availableSeats: 32,
      type: "AC Semi Sleeper",
      rating: 4.0,
      operator: "Royal Travels",
      busNumber: "MH12CD5678",
      seatLayout: "2+2",
      amenities: ["WiFi", "Charging Port", "Water Bottle"]
    },
    {
      id: "BUS-003",
      name: "Delhi Express",
      from: "Delhi",
      to: "Jaipur",
      departureTime: "08:00",
      arrivalTime: "13:30",
      fare: 350,
      totalSeats: 42,
      availableSeats: 36,
      type: "AC Semi Sleeper",
      rating: 4.0,
      operator: "Delhi Express",
      busNumber: "DL08EF9012",
      seatLayout: "2+2",
      amenities: ["WiFi", "Charging Port", "Water Bottle"]
    },
    {
      id: "BUS-004",
      name: "Kolkata Rider",
      from: "Kolkata",
      to: "Bhubaneswar",
      departureTime: "20:00",
      arrivalTime: "05:00",
      fare: 480,
      totalSeats: 36,
      availableSeats: 30,
      type: "AC Sleeper",
      rating: 4.2,
      operator: "Kolkata Travels",
      busNumber: "WB19GH3456",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Water Bottle"]
    },
    {
      id: "BUS-005",
      name: "Ahmedabad Express",
      from: "Ahmedabad",
      to: "Mumbai",
      departureTime: "22:00",
      arrivalTime: "06:30",
      fare: 420,
      totalSeats: 40,
      availableSeats: 34,
      type: "AC Sleeper",
      rating: 4.1,
      operator: "Gujarat Travels",
      busNumber: "GJ01IJ7890",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Water Bottle"]
    },
    {
      id: "BUS-006",
      name: "Kochi Express",
      from: "Kochi",
      to: "Bangalore",
      departureTime: "21:30",
      arrivalTime: "08:00",
      fare: 550,
      totalSeats: 38,
      availableSeats: 32,
      type: "AC Sleeper",
      rating: 4.3,
      operator: "Kerala Travels",
      busNumber: "KL07KL1234",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Water Bottle", "Snacks"]
    },
    {
      id: "BUS-007",
      name: "Hyderabad Link",
      from: "Hyderabad",
      to: "Chennai",
      departureTime: "23:00",
      arrivalTime: "07:00",
      fare: 520,
      totalSeats: 40,
      availableSeats: 35,
      type: "AC Sleeper",
      rating: 4.1,
      operator: "South Travels",
      busNumber: "TS09MN5678",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Water Bottle"]
    },
    {
      id: "BUS-008",
      name: "Pune Express",
      from: "Pune",
      to: "Goa",
      departureTime: "23:00",
      arrivalTime: "08:30",
      fare: 650,
      totalSeats: 35,
      availableSeats: 28,
      type: "AC Sleeper",
      rating: 4.4,
      operator: "Maharashtra Travels",
      busNumber: "MH14OP9012",
      seatLayout: "2+1",
      amenities: ["WiFi", "Charging Port", "Blanket", "Pillow", "Water Bottle"]
    }
  ];

  // Generate buses for next 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    defaultRoutes.forEach((route) => {
      const departureDateTime = new Date(currentDate);
      const [depHour, depMinute] = route.departureTime.split(':');
      departureDateTime.setHours(parseInt(depHour), parseInt(depMinute), 0, 0);

      const arrivalDateTime = new Date(departureDateTime);
      const [arrHour, arrMinute] = route.arrivalTime.split(':');
      arrivalDateTime.setHours(parseInt(arrHour), parseInt(arrMinute), 0, 0);

      // If arrival is next day
      if (arrivalDateTime <= departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      buses.push({
        ...route,
        id: `${route.id}-${day}`,
        departure: departureDateTime.toISOString(),
        arrival: arrivalDateTime.toISOString(),
        bookedSeats: [],
        status: "On Time",
        imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
        description: `Daily service from ${route.from} to ${route.to}`,
        checkpoints: [
          { name: route.from, time: route.departureTime, type: "start" },
          { name: route.to, time: route.arrivalTime, type: "end" }
        ]
      });
    });
  }

  return buses;
}

export const INITIAL_BUSES = generateDailyBuses();

export const BUS_TYPES = ["AC Sleeper", "AC Semi Sleeper", "Non AC", "Volvo AC", "Multi Axle"];

export const AMENITIES = [
  "WiFi", "Charging Port", "Blanket", "Pillow", "Water Bottle",
  "Snacks", "Entertainment", "Reading Light", "GPS Tracking", "CCTV"
];
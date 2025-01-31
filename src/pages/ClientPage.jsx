import { useState, useEffect } from "react";
import  supabase   from "../services/supabase";
import { differenceInDays } from "date-fns";
import Spinner from "../ui/Spinner";

function ClientPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    startDate: "",
    endDate: "",
    cabinId: "",
    numGuests: 1,
    hasBreakfast: false,
    observations: "",
  });

  const [cabins, setCabins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch available cabins
  useEffect(() => {
    const fetchCabins = async () => {
      const { data, error } = await supabase
        .from("cabins")
        .select("id, name, regularPrice, discount")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching cabins:", error);
      if (data) setCabins(data);
    };
    fetchCabins();
  }, []);

  // Calculate price when dates or cabin changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (formData.cabinId && formData.startDate && formData.endDate) {
        const cabin = cabins.find((c) => c.id === Number(formData.cabinId));
        const numNights = differenceInDays(
          new Date(formData.endDate),
          new Date(formData.startDate)
        );

        const cabinPrice =
          (cabin.regularPrice - (cabin.discount || 0)) * numNights;
        const extrasPrice = formData.hasBreakfast
          ? 15 * numNights * formData.numGuests
          : 0;
        setTotalPrice(cabinPrice + extrasPrice);
      }
    };
    calculatePrice();
  }, [
    formData.cabinId,
    formData.startDate,
    formData.endDate,
    formData.hasBreakfast,
    formData.numGuests,
    cabins,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Create guest first
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .insert([
          {
            fullName: formData.fullName,
            email: formData.email,
          },
        ])
        .select();

      if (guestError) throw guestError;

      // 2. Create booking
      const { error: bookingError } = await supabase.from("bookings").insert([
        {
          start_date: formData.startDate,
          end_date: formData.endDate,
          num_nights: differenceInDays(
            new Date(formData.endDate),
            new Date(formData.startDate)
          ),
          num_guests: formData.numGuests,
          cabin_price:
            totalPrice -
            (formData.hasBreakfast
              ? 15 *
                formData.numGuests *
                differenceInDays(
                  new Date(formData.endDate),
                  new Date(formData.startDate)
                )
              : 0),
          extras_price: formData.hasBreakfast
            ? 15 *
              formData.numGuests *
              differenceInDays(
                new Date(formData.endDate),
                new Date(formData.startDate)
              )
            : 0,
          total_price: totalPrice,
          status: "unconfirmed",
          has_breakfast: formData.hasBreakfast,
          is_paid: false,
          observations: formData.observations,
          cabin_id: formData.cabinId,
          guest_id: guest[0].id,
        },
      ]);

      if (bookingError) throw bookingError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        fullName: "",
        email: "",
        startDate: "",
        endDate: "",
        cabinId: "",
        numGuests: 1,
        hasBreakfast: false,
        observations: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Stay</h1>

      {error && (
        <div className="bg-red-100 p-3 mb-4 rounded-md text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 p-3 mb-4 rounded-md text-green-700">
          Booking created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cabin</label>
            <select
              name="cabinId"
              value={formData.cabinId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a cabin</option>
              {cabins.map((cabin) => (
                <option key={cabin.id} value={cabin.id}>
                  {cabin.name} (${cabin.regularPrice - (cabin.discount || 0)}
                  /night)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              name="numGuests"
              min="1"
              max="10"
              value={formData.numGuests}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hasBreakfast"
            checked={formData.hasBreakfast}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">
            Include breakfast ($15/day per person)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Special Requests
          </label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            className="w-full p-2 border rounded-md h-24"
            placeholder="Any special requirements or requests..."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Price Summary</h3>
          <p className="text-xl font-bold text-blue-600">
            Total: ${totalPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formData.startDate &&
              formData.endDate &&
              `${differenceInDays(
                new Date(formData.endDate),
                new Date(formData.startDate)
              )} nights`}
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}

export default ClientPage;

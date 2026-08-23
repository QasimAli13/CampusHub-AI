import { useState, useEffect, useContext } from "react";
import { PlusCircle, X, Calendar, MapPin, Users, Check } from "lucide-react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Events() {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State matching backend exactly
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [reservingId, setReservingId] = useState(null);

  // Role check: Society Head, Admin, or Teacher
  const canCreateEvent =
    user?.role === "society_admin" ||
    user?.role === "society_head" ||
    user?.role === "admin" ||
    user?.role === "teacher";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events");
      setEvents(res.data.data || []);
    } catch (err) {
      console.log("Fetch events error:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);

    try {
      // Sending exact keys expected by backend: title, description, date, location, capacity
      const res = await API.post("/events", {
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim(),
        capacity: Number(capacity),
      });

      if (res.data.success) {
        alert("Event created successfully!");
        setTitle("");
        setDate("");
        setLocation("");
        setCapacity("");
        setDescription("");
        setShowCreateForm(false);
        fetchEvents();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleRegisterSeat = async (eventId) => {
    setReservingId(eventId);
    try {
      const res = await API.post(`/events/${eventId}/register`);
      if (res.data.success) {
        alert("Successfully registered for event!");
        fetchEvents();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Registration failed or seats full!",
      );
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">Campus Events & Workshops</h1>
          <p className="page-subtitle">
            Explore upcoming university seminars, hackathons, and society fests.
          </p>
        </div>

        {canCreateEvent && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? <X size={16} /> : <PlusCircle size={16} />}
            <span>{showCreateForm ? "Cancel" : "Create Event"}</span>
          </button>
        )}
      </div>

      {/* Society Head Post Event Form */}
      {canCreateEvent && showCreateForm && (
        <form onSubmit={handleCreateEvent} className="card card-form">
          <h3 className="assignment-title">Publish Campus Event</h3>

          {formError && <div className="alert-error">{formError}</div>}

          <input
            type="text"
            placeholder="Event Title (e.g. Annual Tech Symposium 2026)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />

          <div className="form-grid-2">
            <div>
              <label
                className="text-subtle"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label
                className="text-subtle"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Venue / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium / Lab 3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="text-subtle"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Total Seats Capacity
            </label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="input-field"
              min="1"
              required
            />
          </div>

          <textarea
            placeholder="Event details, schedule, and guest speaker information..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows="4"
            required
          />

          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Publishing Event..." : "Publish Event"}
          </button>
        </form>
      )}

      {/* Events List */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p className="page-subtitle">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "50px 20px" }}
        >
          <Calendar
            size={40}
            color="#48CAE4"
            style={{ marginBottom: "12px" }}
          />
          <h3 className="assignment-title" style={{ marginBottom: "6px" }}>
            No Upcoming Events
          </h3>
          <p className="page-subtitle">
            {canCreateEvent
              ? "No events published yet. Click 'Create Event' above to post one."
              : "There are no upcoming society events scheduled right now. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="list-stack">
          {events.map((event) => {
            const registeredList = event.registeredStudents || [];
            const isRegistered = registeredList.some(
              (item) => (item._id || item).toString() === user?._id?.toString(),
            );
            const registeredCount = registeredList.length;
            const isFull = registeredCount >= event.capacity;

            return (
              <div key={event._id} className="card">
                <div className="assignment-header">
                  <div>
                    <h3 className="assignment-title">{event.title}</h3>
                  </div>
                  <span
                    className="badge badge-neutral"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Users size={13} />
                    {registeredCount} / {event.capacity} Seats
                  </span>
                </div>

                <p className="assignment-desc">{event.description}</p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    margin: "12px 0",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Calendar size={14} color="#48CAE4" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <MapPin size={14} color="#48CAE4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="assignment-footer">
                  <span className="text-subtle" style={{ fontSize: "12px" }}>
                    Organized by: {event.organizer?.name || "Society Admin"}
                  </span>

                  {isRegistered ? (
                    <span
                      className="badge badge-success"
                      style={{ padding: "8px 14px", fontSize: "13px" }}
                    >
                      <Check size={14} /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegisterSeat(event._id)}
                      disabled={isFull || reservingId === event._id}
                      className="btn-primary"
                    >
                      {reservingId === event._id
                        ? "Reserving..."
                        : isFull
                          ? "Seats Full"
                          : "Reserve Seat"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const API_URL = "https://reservation-system-drab.vercel.app/api";

// helper do pobierania JSONa
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Błąd ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// załaduj obiekty
async function loadProperties() {
  const properties = await fetchData("/properties");
  const list = document.getElementById("properties");
  list.innerHTML = properties.map(p => `<li>${p.name} (${p.city})</li>`).join("");
}

// załaduj pokoje
async function loadRooms() {
  const rooms = await fetchData("/rooms");
  const list = document.getElementById("rooms");
  list.innerHTML = rooms.map(r => `<li>${r.name} — dla ${r.capacity} osób</li>`).join("");
}

// załaduj rezerwacje
async function loadBookings() {
  const bookings = await fetchData("/bookings");
  const list = document.getElementById("bookings");
  list.innerHTML = bookings.map(b => 
    `<li>Rezerwacja #${b.id}: ${b.from_date} → ${b.to_date} [status: ${b.status}]</li>`
  ).join("");
}

// start
loadProperties();
loadRooms();
loadBookings();

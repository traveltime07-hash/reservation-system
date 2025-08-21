async function fetchData(endpoint, elementId, formatter) {
  try {
    const res = await fetch(`/api/${endpoint}`);
    const data = await res.json();
    const list = document.getElementById(elementId);
    list.innerHTML = "";

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = formatter ? formatter(item) : JSON.stringify(item);
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>Brak danych</li>";
    }
  } catch (err) {
    console.error(err);
    document.getElementById(elementId).innerHTML = "<li>Błąd ładowania</li>";
  }
}

// Formatery – ładne wyświetlanie
fetchData("properties", "properties", (item) => `${item.name} (${item.city})`);
fetchData("rooms", "rooms", (item) => `Pokój: ${item.name}`);
fetchData("bookings", "bookings", (item) => `Rezerwacja ID: ${item.id} od ${item.from_date} do ${item.to_date}`);
fetchData("payments", "payments", (item) => `Płatność: ${item.amount} (${item.status})`);

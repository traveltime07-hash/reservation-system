// Funkcja pomocnicza: pobierz dane z API i pokaż w elemencie UL
async function loadData(endpoint, ulId) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = "<li>⏳ Ładowanie...</li>";

  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      ul.innerHTML = "<li>Brak danych</li>";
      return;
    }

    ul.innerHTML = "";
    data.forEach(item => {
      let text = "";
      switch (endpoint) {
        case "properties":
          text = `${item.name} (${item.city})`;
          break;
        case "rooms":
          text = `Pokój: ${item.name} — obiekt #${item.property_id}`;
          break;
        case "bookings":
          text = `Rezerwacja #${item.id}: od ${item.from_date} do ${item.to_date}`;
          break;
        case "payments":
          text = `Płatność #${item.id}: ${item.amount} PLN, status: ${item.status}`;
          break;
        default:
          text = JSON.stringify(item);
      }
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
  } catch (err) {
    ul.innerHTML = `<li style="color:red;">❌ Błąd: ${err.message}</li>`;
  }
}

// Po załadowaniu strony — odpal wszystkie
window.addEventListener("DOMContentLoaded", () => {
  loadData("properties", "properties");
  loadData("rooms", "rooms");
  loadData("bookings", "bookings");
  loadData("payments", "payments");
});

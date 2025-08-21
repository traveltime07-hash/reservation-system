async function fetchData(endpoint, elementId) {
  try {
    const res = await fetch(`/api/${endpoint}`);
    const data = await res.json();
    const list = document.getElementById(elementId);
    list.innerHTML = "";
    if (Array.isArray(data)) {
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = JSON.stringify(item);
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

fetchData("properties", "properties");
fetchData("rooms", "rooms");
fetchData("bookings", "bookings");
fetchData("payments", "payments");

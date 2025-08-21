async function fetchJSON(url, opts){
  const res = await fetch(url, { headers:{'Content-Type':'application/json'}, ...opts });
  if(!res.ok){ throw new Error(await res.text()) }
  return res.json();
}

const propertySel = document.getElementById('property');
const roomSel = document.getElementById('room');
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const checkBtn = document.getElementById('check');
const availabilityDiv = document.getElementById('availability');
const bookBtn = document.getElementById('book');
const bookingDiv = document.getElementById('booking');
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');

async function loadProperties(){
  const props = await fetchJSON('/api/properties');
  propertySel.innerHTML = props.map(p=>`<option value="${p.id}">${p.name} — ${p.city}</option>`).join('');
  await loadRooms();
}

async function loadRooms(){
  const pid = propertySel.value;
  const rooms = await fetchJSON('/api/rooms?property_id='+pid);
  roomSel.innerHTML = rooms.map(r=>`<option value="${r.id}">${r.name} — ${r.capacity} os. — ${r.price_per_night} PLN</option>`).join('');
}

propertySel.addEventListener('change', loadRooms);

checkBtn.addEventListener('click', async ()=>{
  availabilityDiv.textContent = 'Sprawdzam...';
  try{
    const room_id = roomSel.value;
    const from = fromEl.value;
    const to = toEl.value;
    const r = await fetchJSON(`/api/availability?room_id=${room_id}&from=${from}&to=${to}`);
    if(r.available){
      availabilityDiv.innerHTML = '<span style="color:green">Dostępne ✔</span>';
      bookBtn.disabled = false;
    }else{
      availabilityDiv.innerHTML = '<span style="color:#b00">Zajęte ✖</span>';
      bookBtn.disabled = true;
    }
  }catch(e){
    availabilityDiv.textContent = 'Błąd: '+e.message;
  }
});

bookBtn.addEventListener('click', async ()=>{
  bookingDiv.textContent = 'Tworzę rezerwację...';
  try{
    const payload = {
      room_id: Number(roomSel.value),
      from: fromEl.value,
      to: toEl.value,
      customer_name: nameEl.value || null,
      customer_email: emailEl.value
    };
    const r = await fetchJSON('/api/bookings', { method:'POST', body: JSON.stringify(payload) });
    bookingDiv.innerHTML = `Utworzono rezerwację #${r.id} (status: ${r.status}). <a href="${r.payment_url}">Przejdź do płatności (symulacja)</a>`;
  }catch(e){
    bookingDiv.textContent = 'Błąd: '+e.message;
  }
});

loadProperties().catch(e=>console.error(e));

-- Użytkownik owner + przykładowe dane
-- Hasło (bcrypt) = owner123
INSERT INTO users (email, password_hash, name, role) VALUES
  ('owner@example.com', '$2a$10$8w4m3b8Z8Y7l0f5mB2xN7e2QmHk3e3m0QGf9S9o6xK4d9Q6r5J0fO', 'Właściciel', 'owner')
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties (owner_id, name, city, address, description)
SELECT id, 'Apartamenty Słoneczne', 'Gdańsk', 'ul. Morska 10', 'Blisko plaży'
FROM users WHERE email='owner@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (property_id, name, capacity, price_per_night)
SELECT p.id, 'Studio 2-os.', 2, 220.00 FROM properties p WHERE p.name='Apartamenty Słoneczne'
ON CONFLICT DO NOTHING;

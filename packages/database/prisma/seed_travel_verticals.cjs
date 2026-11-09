const path = require('path');
const fs = require('fs');
const { Client } = require(path.join(__dirname, 'node_modules', 'pg'));
const crypto = require('crypto');

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const client = new Client({ connectionString: match[1] });

async function seed() {
  await client.connect();
  console.log("Connected to Neon DB successfully.");

  const tenantRes = await client.query("SELECT id FROM tenants LIMIT 1");
  if (tenantRes.rows.length === 0) {
    console.error("No tenant found!");
    process.exit(1);
  }
  const tenantId = tenantRes.rows[0].id;
  console.log("Using tenantId:", tenantId);

  // 1. Seed Tours
  console.log("--- Seeding Tours ---");
  const toursData = [
    {
      title: "Sundarbans Mangrove Royal Bengal Tiger Expedition",
      slug: "sundarbans-mangrove-safari",
      duration_days: 3,
      duration_hours: 72,
      min_pax: 2,
      max_pax: 16,
      base_price_adult: 18500,
      description: "Deep riverine wilderness cruise through UNESCO heritage Sundarbans mangrove biosphere with expert naturalists and armed forest escorts.",
      inclusions: [
        "AC cabin cruise ship aboard vessel",
        "Buffet meals and fresh seafood barbecues",
        "Certified naturalist and armed forest escorts",
        "Forest Department permission & photography permits"
      ],
      itinerary: [
        { day: 1, title: "Mongla Port Embarkation & Kotka Sanctuary Entry", desc: "Board the luxury expedition cruiser at Mongla and glide past pristine mangrove channels into Kotka wildlife sanctuary." },
        { day: 2, title: "Jamtoli Watch Tower & Kachikhali Tiger Creek Safari", desc: "Dawn silence boat canal exploration to spot deer, estuarine crocodiles, and Royal Bengal Tigers, followed by a jungle canopy walk." },
        { day: 3, title: "Harbaria Eco-Walk & Return Cruise to Khulna", desc: "Morning foot trek across Harbaria wooden boardwalk and return journey back to Mongla with sunset river views." }
      ]
    },
    {
      title: "Saint Martin Coral Atoll & Chhera Island Sail",
      slug: "saint-martin-coral-atoll",
      duration_days: 2,
      duration_hours: 48,
      min_pax: 2,
      max_pax: 20,
      base_price_adult: 14500,
      description: "Exclusive catamaran sailing expedition across the Bay of Bengal to the crystal waters and coral reefs of Saint Martin and Chhera Dwip.",
      inclusions: [
        "Catamaran cruise transfer across Bay of Bengal",
        "Beachfront boutique resort stay",
        "Snorkeling gear & reef instructor",
        "Fresh green coconut & live lobster dinner"
      ],
      itinerary: [
        { day: 1, title: "Teknaf Departure & Saint Martin Island Welcome", desc: "Scenic ocean crossing aboard premier cruise vessel, island check-in, and sunset cycling along West Beach." },
        { day: 2, title: "Chhera Dwip Coral Exploration & Return Sail", desc: "Traditional wooden speed craft to uninhabited coral islet of Chhera Dwip for snorkeling amidst living marine corals." }
      ]
    },
    {
      title: "Sreemangal Rainforest & Tea Highlands Safari",
      slug: "sreemangal-rainforest-tea-highlands",
      duration_days: 2,
      duration_hours: 48,
      min_pax: 2,
      max_pax: 12,
      base_price_adult: 12000,
      description: "Trek through Lawachara National Park rain forest, spot endangered Hoolock Gibbons, and experience artisanal tea estate tastings.",
      inclusions: [
        "Private 4x4 safari jeep with guide",
        "Colonial tea bungalow heritage stay",
        "Lawachara National Park wildlife permit",
        "Traditional seven-layer tea ceremony"
      ],
      itinerary: [
        { day: 1, title: "Lawachara Canopy Trek & Khasia Tribal Village", desc: "Trek through towering rain trees to spot rare bird species and learn centuries-old betel leaf farming traditions." },
        { day: 2, title: "Madhabpur Lake Lotus Sanctuary & Tea Tasting", desc: "Early morning reflection hike along Madhabpur lotus lake and private masterclass on white tea craftsmanship." }
      ]
    }
  ];

  for (const t of toursData) {
    const existing = await client.query("SELECT id FROM tours WHERE slug = $1", [t.slug]);
    let tourId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO tours (id, tenant_id, title, slug, duration_days, duration_hours, min_pax, max_pax, base_price_adult, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())
         RETURNING id;`,
        [tenantId, t.title, t.slug, t.duration_days, t.duration_hours, t.min_pax, t.max_pax, t.base_price_adult]
      );
      tourId = ins.rows[0].id;
      console.log(`Created Tour: ${t.title} (${tourId})`);
    } else {
      tourId = existing.rows[0].id;
      console.log(`Tour already exists: ${t.title}`);
    }

    // Translations
    await client.query(
      `INSERT INTO tour_translations (id, tour_id, locale, title, description, created_at)
       VALUES (gen_random_uuid(), $1, 'en', $2, $3, NOW())
       ON CONFLICT (tour_id, locale) DO UPDATE SET title = $2, description = $3;`,
      [tourId, t.title, t.description]
    );

    // Inclusions
    await client.query("DELETE FROM tour_inclusions WHERE tour_id = $1", [tourId]);
    for (const inc of t.inclusions) {
      await client.query(
        `INSERT INTO tour_inclusions (id, tour_id, content, is_inclusion, created_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW());`,
        [tourId, inc]
      );
    }

    // Itineraries
    await client.query("DELETE FROM tour_itineraries WHERE tour_id = $1", [tourId]);
    for (const it of t.itinerary) {
      await client.query(
        `INSERT INTO tour_itineraries (id, tour_id, day_number, title, description, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW());`,
        [tourId, it.day, it.title, it.desc]
      );
    }
  }

  // 2. Seed Cars
  console.log("--- Seeding Cars ---");
  const carsData = [
    {
      title: "Mercedes-Benz S-Class S580 Executive",
      slug: "mercedes-benz-s580-executive",
      category: "Luxury",
      transmission: "Automatic",
      passenger_seats: 4,
      baggage_count: 3,
      door_count: 4,
      fuel_type: "Hybrid",
      daily_price: 32000,
      description: "The pinnacle of executive luxury mobility. Includes professional suited English-speaking chauffeur, in-cabin Wi-Fi, refreshments, and VIP airport lounge assistance."
    },
    {
      title: "Toyota Land Cruiser 300 VXR VIP",
      slug: "toyota-land-cruiser-300-vxr",
      category: "Luxury SUV",
      transmission: "Automatic",
      passenger_seats: 6,
      baggage_count: 5,
      door_count: 5,
      fuel_type: "Diesel",
      daily_price: 28000,
      description: "Rugged supreme commanding presence for VIP delegations, executive outstation travel, and coastal expeditions."
    },
    {
      title: "BMW 7 Series 740Li Individual",
      slug: "bmw-740li-individual",
      category: "Executive Sedan",
      transmission: "Automatic",
      passenger_seats: 4,
      baggage_count: 3,
      door_count: 4,
      fuel_type: "Petrol",
      daily_price: 29500,
      description: "Rear executive lounge seating, panoramic sky lounge roof, and dynamic ride comfort for C-level executives."
    }
  ];

  for (const c of carsData) {
    const existing = await client.query("SELECT id FROM cars WHERE slug = $1", [c.slug]);
    let carId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO cars (id, tenant_id, title, slug, category, transmission, passenger_seats, baggage_count, door_count, fuel_type, daily_price, is_unlimited_mileage, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, 'active', NOW(), NOW())
         RETURNING id;`,
        [tenantId, c.title, c.slug, c.category, c.transmission, c.passenger_seats, c.baggage_count, c.door_count, c.fuel_type, c.daily_price]
      );
      carId = ins.rows[0].id;
      console.log(`Created Car: ${c.title} (${carId})`);
    } else {
      carId = existing.rows[0].id;
      console.log(`Car already exists: ${c.title}`);
    }

    await client.query(
      `INSERT INTO car_translations (id, car_id, locale, title, description, created_at)
       VALUES (gen_random_uuid(), $1, 'en', $2, $3, NOW())
       ON CONFLICT (car_id, locale) DO UPDATE SET title = $2, description = $3;`,
      [carId, c.title, c.description]
    );
  }

  // 3. Seed Boats
  console.log("--- Seeding Boats ---");
  const boatsData = [
    {
      title: "Azimut Grande 27M Superyacht",
      slug: "azimut-grande-27m",
      vessel_type: "Superyacht",
      length_meters: 27,
      guest_capacity: 14,
      berths_count: 5,
      daily_price: 185000,
      charter_type: "fully_crewed",
      description: "Breathtaking Italian luxury yacht with full crew, five-star private chef, expansive flybridge, jacuzzi, and water sports tender."
    },
    {
      title: "Sunseeker Manhattan 68 Flybridge",
      slug: "sunseeker-manhattan-68",
      vessel_type: "Motor Yacht",
      length_meters: 21,
      guest_capacity: 12,
      berths_count: 4,
      daily_price: 125000,
      charter_type: "fully_crewed",
      description: "Effortless offshore entertaining with panoramic sea views, state-of-the-art stabilizers, and dedicated captain."
    }
  ];

  for (const b of boatsData) {
    const existing = await client.query("SELECT id FROM boats WHERE slug = $1", [b.slug]);
    let boatId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO boats (id, tenant_id, title, slug, vessel_type, length_meters, guest_capacity, berths_count, daily_price, charter_type, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', NOW(), NOW())
         RETURNING id;`,
        [tenantId, b.title, b.slug, b.vessel_type, b.length_meters, b.guest_capacity, b.berths_count, b.daily_price, b.charter_type]
      );
      boatId = ins.rows[0].id;
      console.log(`Created Boat: ${b.title} (${boatId})`);
    } else {
      boatId = existing.rows[0].id;
      console.log(`Boat already exists: ${b.title}`);
    }

    await client.query(
      `INSERT INTO boat_translations (id, boat_id, locale, title, description, created_at)
       VALUES (gen_random_uuid(), $1, 'en', $2, $3, NOW())
       ON CONFLICT (boat_id, locale) DO UPDATE SET title = $2, description = $3;`,
      [boatId, b.title, b.description]
    );
  }

  // 4. Seed Spaces
  console.log("--- Seeding Spaces ---");
  const spacesData = [
    {
      title: "The Imperial Grand Ballroom",
      slug: "the-imperial-grand-ballroom",
      venue_type: "ballroom",
      hourly_price: 25000,
      daily_price: 220000,
      capacity_pax: 650,
      square_meters: 850,
      cleaning_fee: 15000,
      security_deposit: 50000,
      description: "Pillarless crystal-chandelier banquet hall featuring Meyer Sound acoustics, intelligent theatrical lighting, and dedicated banquet kitchen."
    },
    {
      title: "Apex Sovereign Executive Boardroom",
      slug: "apex-sovereign-executive-boardroom",
      venue_type: "conference",
      hourly_price: 12000,
      daily_price: 85000,
      capacity_pax: 36,
      square_meters: 120,
      cleaning_fee: 5000,
      security_deposit: 20000,
      description: "High-security boardroom with 4K video telepresence, encrypted Cisco conferencing, motorized privacy shades, and executive catering pantry."
    }
  ];

  for (const s of spacesData) {
    const existing = await client.query("SELECT id FROM spaces WHERE slug = $1", [s.slug]);
    let spaceId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO spaces (id, tenant_id, title, slug, venue_type, hourly_price, daily_price, capacity_pax, square_meters, cleaning_fee, security_deposit, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', NOW(), NOW())
         RETURNING id;`,
        [tenantId, s.title, s.slug, s.venue_type, s.hourly_price, s.daily_price, s.capacity_pax, s.square_meters, s.cleaning_fee, s.security_deposit]
      );
      spaceId = ins.rows[0].id;
      console.log(`Created Space: ${s.title} (${spaceId})`);
    } else {
      spaceId = existing.rows[0].id;
      console.log(`Space already exists: ${s.title}`);
    }

    await client.query(
      `INSERT INTO space_translations (id, space_id, locale, title, description, created_at)
       VALUES (gen_random_uuid(), $1, 'en', $2, $3, NOW())
       ON CONFLICT (space_id, locale) DO UPDATE SET title = $2, description = $3;`,
      [spaceId, s.title, s.description]
    );
  }

  // 5. Seed Events
  console.log("--- Seeding Events ---");
  const eventsData = [
    {
      title: "Global Hospitality & Tech Innovation Summit 2026",
      slug: "hospitality-tech-innovation-summit-2026",
      event_type: "Conference",
      venue_address: "Grand Palace Convention Center, Gulshan Avenue, Dhaka",
      start_date: new Date("2026-11-25T09:00:00Z"),
      end_date: new Date("2026-11-26T18:00:00Z"),
      max_capacity: 500,
      description: "The flagship conference uniting global travel leaders, hotel executives, IoT pioneers, and fintech visionaries.",
      ticketTiers: [
        { name: "Standard Delegate Pass", price: 5000, total_seats: 350 },
        { name: "VIP Executive All-Access Pass", price: 15000, total_seats: 150 }
      ]
    },
    {
      title: "Royal Gala & Culinary Symphony Night",
      slug: "royal-gala-culinary-symphony",
      event_type: "Gala",
      venue_address: "The Imperial Grand Ballroom, Dhaka",
      start_date: new Date("2026-12-05T19:00:00Z"),
      end_date: new Date("2026-12-05T23:30:00Z"),
      max_capacity: 250,
      description: "A 7-course Michelin-starred chef banquet with live chamber orchestra, premium pairing, and charity auction.",
      ticketTiers: [
        { name: "Gold Table Seat", price: 12000, total_seats: 180 },
        { name: "Platinum Royal Table", price: 25000, total_seats: 70 }
      ]
    }
  ];

  for (const e of eventsData) {
    const existing = await client.query("SELECT id FROM events WHERE slug = $1", [e.slug]);
    let eventId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO events (id, tenant_id, title, slug, event_type, venue_address, start_date, end_date, max_capacity, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())
         RETURNING id;`,
        [tenantId, e.title, e.slug, e.event_type, e.venue_address, e.start_date, e.end_date, e.max_capacity]
      );
      eventId = ins.rows[0].id;
      console.log(`Created Event: ${e.title} (${eventId})`);
    } else {
      eventId = existing.rows[0].id;
      console.log(`Event already exists: ${e.title}`);
    }

    await client.query(
      `INSERT INTO event_translations (id, event_id, locale, title, description, created_at)
       VALUES (gen_random_uuid(), $1, 'en', $2, $3, NOW())
       ON CONFLICT (event_id, locale) DO UPDATE SET title = $2, description = $3;`,
      [eventId, e.title, e.description]
    );

    await client.query("DELETE FROM event_ticket_tiers WHERE event_id = $1", [eventId]);
    for (const tier of e.ticketTiers) {
      await client.query(
        `INSERT INTO event_ticket_tiers (id, event_id, name, price, total_seats, booked_seats, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, NOW());`,
        [eventId, tier.name, tier.price, tier.total_seats]
      );
    }
  }

  console.log("=== Seed Complete! All travel verticals seeded successfully ===");
  await client.end();
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});

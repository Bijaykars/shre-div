import { getDb } from "../api/queries/connection";
import {
  categories,
  heroSlides,
  products,
  siteSettings,
  testimonials,
} from "./schema";

const IMG = "/images";

// Months, so clothing and toys share one age scale.
const M = (months: number) => months;
const Y = (years: number) => years * 12;

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existing = await db.query.categories.findFirst();
  if (existing) {
    console.log("Database already seeded — skipping.");
    process.exit(0);
  }

  /* ------------------------------- Categories ------------------------------ */
  const catRows = await db
    .insert(categories)
    .values([
      /* -- Clothing -- */
      {
        name: "Everyday & Rompers",
        slug: "everyday-rompers",
        tagline: "Cloud-soft cottons for crawling, napping and everything between",
        department: "clothing",
        image: `${IMG}/products/smocked-romper.jpg`,
        sortOrder: 1,
      },
      {
        name: "Party & Occasion",
        slug: "party-occasion",
        tagline: "Twirl-worthy frocks for birthdays and big days",
        department: "clothing",
        image: `${IMG}/products/pearl-floor-gown.jpg`,
        sortOrder: 2,
      },
      {
        name: "Traditional & Festive",
        slug: "traditional-festive",
        tagline: "Lehengas, kurtas and daura suruwal, hand-finished in Kathmandu",
        department: "clothing",
        image: `${IMG}/products/raw-silk-lehenga.jpg`,
        sortOrder: 3,
      },

      /* -- Toys & Games -- */
      {
        name: "Soft Toys & Comforters",
        slug: "soft-toys",
        tagline: "First friends, safe from day one",
        department: "toys",
        sortOrder: 4,
      },
      {
        name: "Learning & Puzzles",
        slug: "learning-puzzles",
        tagline: "Blocks, shapes and stacking — play that teaches",
        department: "toys",
        sortOrder: 5,
      },
      {
        name: "Ride-Ons & Outdoor",
        slug: "ride-ons-outdoor",
        tagline: "Trikes, walkers and garden games for busy legs",
        department: "toys",
        sortOrder: 6,
      },

      /* -- Nursery & Gear -- */
      {
        name: "Cots & Bedding",
        slug: "cots-bedding",
        tagline: "Cots, mattresses and breathable cotton bedding",
        department: "nursery",
        sortOrder: 7,
      },
      {
        name: "Strollers & Carriers",
        slug: "strollers-carriers",
        tagline: "Prams, carriers and car seats built for Kathmandu streets",
        department: "nursery",
        sortOrder: 8,
      },
      {
        name: "Feeding & High Chairs",
        slug: "feeding-high-chairs",
        tagline: "Bottles, sterilisers and chairs for the messy years",
        department: "nursery",
        sortOrder: 9,
      },
    ])
    .$returningId();

  const [
    everyday,
    party,
    festive,
    softToys,
    learning,
    rideOns,
    cots,
    strollers,
    feeding,
  ] = catRows.map((r) => r.id);

  /* -------------------------------- Products ------------------------------- */
  // Photography exists for the clothing lines; toys and gear ship without images
  // until the shop uploads their own through the admin panel.
  await db.insert(products).values([
    /* ---- Clothing ---- */
    {
      name: "Hand-Smocked Cotton Romper",
      slug: "hand-smocked-cotton-romper",
      description:
        "Hand-smocked across the chest in soft combed cotton, with poppers all the way down for unhurried nappy changes.",
      details: "100% combed cotton · Nickel-free poppers · Machine wash cold",
      price: 2450,
      categoryId: everyday,
      image: `${IMG}/products/smocked-romper.jpg`,
      badge: "bestseller",
      ageMinMonths: M(0),
      ageMaxMonths: M(18),
      sizes: "0-3M, 3-6M, 6-12M, 12-18M",
      stock: 20,
      isFeatured: true,
    },
    {
      name: "Petit Floral Two-Piece Set",
      slug: "petit-floral-two-piece-set",
      description:
        "A loose floral top and matching bloomers — the set that ends up in every summer photograph.",
      details: "Cotton lawn · Elasticated waist · Machine wash cold",
      price: 2850,
      categoryId: everyday,
      image: `${IMG}/products/floral-two-piece.jpg`,
      ageMinMonths: M(6),
      ageMaxMonths: Y(3),
      sizes: "6-12M, 1-2Y, 2-3Y",
      stock: 15,
      isFeatured: true,
    },
    {
      name: "Rosette Tulle Party Frock",
      slug: "rosette-tulle-party-frock",
      description:
        "Layers of whisper-light tulle gathered into hand-sewn rosettes at the bodice. A dress made for birthdays, cake, and very serious twirling.",
      details:
        "Shell: soft nylon tulle · Lining: 100% cotton voile · Back button closure · Dry clean only",
      price: 4850,
      compareAtPrice: 5600,
      categoryId: party,
      image: `${IMG}/products/rosette-tulle-frock.jpg`,
      badge: "new",
      ageMinMonths: Y(2),
      ageMaxMonths: Y(8),
      sizes: "2-3Y, 4-5Y, 6-7Y, 7-8Y",
      stock: 12,
      isFeatured: true,
    },
    {
      name: "Pearl-Embroidered Floor Gown",
      slug: "pearl-embroidered-floor-gown",
      description:
        "Seed pearls hand-set across a full-length gown — kept simple everywhere else so the embroidery does the talking.",
      details: "Hand embroidery · Cotton-lined bodice · Dry clean only",
      price: 8200,
      categoryId: party,
      image: `${IMG}/products/pearl-floor-gown.jpg`,
      badge: "bestseller",
      ageMinMonths: Y(4),
      ageMaxMonths: Y(10),
      sizes: "4-5Y, 6-7Y, 8-9Y, 9-10Y",
      stock: 6,
      isFeatured: true,
    },
    {
      name: "Satin Bow A-Line Dress",
      slug: "satin-bow-a-line-dress",
      description:
        "A clean A-line in heavy satin with an oversized back bow — the dress that photographs well from every angle.",
      details: "Duchess satin · Concealed zip · Dry clean only",
      price: 3950,
      categoryId: party,
      image: `${IMG}/products/satin-bow-dress.jpg`,
      ageMinMonths: Y(2),
      ageMaxMonths: Y(7),
      sizes: "2-3Y, 4-5Y, 6-7Y",
      stock: 9,
    },
    {
      name: "Sequined Butterfly Gown",
      slug: "sequined-butterfly-gown",
      description:
        "Hand-stitched sequin butterflies scattered across soft lilac tulle, layered over a comfortable cotton slip.",
      details: "Sequin tulle · Cotton slip lining · Spot clean",
      price: 6800,
      compareAtPrice: 7500,
      categoryId: party,
      image: `${IMG}/products/sequined-butterfly-gown.jpg`,
      badge: "new",
      ageMinMonths: Y(3),
      ageMaxMonths: Y(9),
      sizes: "3-4Y, 5-6Y, 7-8Y, 8-9Y",
      stock: 7,
    },
    {
      name: "Jari-Work Raw Silk Lehenga",
      slug: "jari-work-raw-silk-lehenga",
      description:
        "Traditional jari worked by hand onto raw silk, cut into a lehenga a child can actually run in.",
      details: "Raw silk · Hand jari embroidery · Adjustable drawstring · Dry clean only",
      price: 10500,
      categoryId: festive,
      image: `${IMG}/products/raw-silk-lehenga.jpg`,
      badge: "limited",
      ageMinMonths: Y(3),
      ageMaxMonths: Y(10),
      sizes: "3-4Y, 5-6Y, 7-8Y, 9-10Y",
      stock: 4,
      isFeatured: true,
    },
    {
      name: "Festive Kurta Set for Boys",
      slug: "festive-kurta-set-for-boys",
      description:
        "A crisp cotton-silk kurta with matching churidar — comfortable enough to be worn all through a long festival day.",
      details: "Cotton-silk blend · Wooden buttons · Gentle machine wash",
      price: 4200,
      categoryId: festive,
      image: `${IMG}/products/boys-kurta-set.jpg`,
      ageMinMonths: Y(2),
      ageMaxMonths: Y(10),
      sizes: "2-3Y, 4-5Y, 6-7Y, 8-9Y",
      stock: 14,
      isFeatured: true,
    },

    /* ---- Toys & Games ---- */
    {
      name: "Organic Cotton Bunny Comforter",
      slug: "organic-cotton-bunny-comforter",
      image: `${IMG}/toys/bunny-comforter.jpg`,
      description:
        "A small, soft bunny with knotted ears that little hands can grip. No loose parts, no plastic eyes.",
      details: "GOTS-certified organic cotton · Embroidered features · Machine washable",
      price: 1450,
      categoryId: softToys,
      brand: "Sano Saathi",
      ageMinMonths: M(0),
      ageMaxMonths: null,
      stock: 30,
      badge: "bestseller",
      isFeatured: true,
    },
    {
      name: "Chunky Knit Elephant",
      slug: "chunky-knit-elephant",
      description:
        "Hand-knitted in soft chunky yarn and weighted just enough to sit up on its own.",
      details: "Hand-knitted cotton yarn · Hypoallergenic filling · Surface wash",
      price: 2200,
      categoryId: softToys,
      brand: "Sano Saathi",
      ageMinMonths: M(0),
      stock: 18,
    },
    {
      name: "Wooden Stacking Rainbow",
      slug: "wooden-stacking-rainbow",
      image: `${IMG}/toys/stacking-rainbow.jpg`,
      description:
        "Twelve solid wood arches in non-toxic pigments. Stacks, balances, becomes a bridge, a tunnel, a fence.",
      details: "Solid beech · Water-based non-toxic paint · Wipe clean",
      price: 3400,
      categoryId: learning,
      brand: "Himali Wood",
      ageMinMonths: Y(1),
      ageMaxMonths: Y(6),
      stock: 16,
      badge: "new",
      isFeatured: true,
    },
    {
      name: "Shape Sorter Cube",
      slug: "shape-sorter-cube",
      description:
        "Nine shapes, nine slots, and the deep satisfaction of getting the triangle in on the first go.",
      details: "Solid wood · Rounded edges · Non-toxic finish",
      price: 1900,
      categoryId: learning,
      brand: "Himali Wood",
      ageMinMonths: M(18),
      ageMaxMonths: Y(4),
      stock: 22,
    },
    {
      name: "Wooden Balance Bike",
      slug: "wooden-balance-bike",
      image: `${IMG}/toys/balance-bike.jpg`,
      description:
        "No pedals, no stabilisers — just the balance that makes the first real bicycle easy.",
      details: "Birch ply frame · Adjustable seat · Puncture-proof tyres · Assembly required",
      price: 8900,
      compareAtPrice: 9800,
      categoryId: rideOns,
      brand: "Everest Kids",
      ageMinMonths: Y(2),
      ageMaxMonths: Y(5),
      stock: 8,
      badge: "bestseller",
      isFeatured: true,
    },
    {
      name: "Push-Along Walker Wagon",
      slug: "push-along-walker-wagon",
      description:
        "A sturdy wooden wagon that steadies first steps and then spends years carrying blocks around the house.",
      details: "Solid wood · Rubber-rimmed wheels · Adjustable resistance",
      price: 6500,
      categoryId: rideOns,
      brand: "Everest Kids",
      ageMinMonths: M(9),
      ageMaxMonths: Y(3),
      stock: 10,
    },

    /* ---- Nursery & Gear ---- */
    {
      name: "Convertible Wooden Cot",
      slug: "convertible-wooden-cot",
      image: `${IMG}/nursery/wooden-cot.jpg`,
      description:
        "Three mattress heights, and one side that comes off to turn it into a toddler bed when the time comes.",
      details: "Solid sal wood · 3 height positions · Converts to toddler bed · Mattress sold separately",
      price: 34500,
      categoryId: cots,
      brand: "Nest & Nook",
      ageMinMonths: M(0),
      ageMaxMonths: Y(4),
      stock: 5,
      isFeatured: true,
    },
    {
      name: "Breathable Cotton Cot Bedding Set",
      slug: "breathable-cotton-cot-bedding-set",
      description:
        "Fitted sheet, light quilt and bumper in double-gauze cotton that softens with every wash.",
      details: "Double-gauze cotton · Fits standard cot · Machine wash warm",
      price: 4800,
      categoryId: cots,
      brand: "Nest & Nook",
      ageMinMonths: M(0),
      ageMaxMonths: Y(4),
      stock: 12,
      badge: "new",
    },
    {
      name: "All-Terrain Stroller",
      slug: "all-terrain-stroller",
      image: `${IMG}/nursery/all-terrain-stroller.jpg`,
      description:
        "Air-filled tyres and real suspension — built for pavements that stop and start without warning.",
      details: "Aluminium frame · One-hand fold · 5-point harness · Rain cover included",
      price: 42000,
      compareAtPrice: 46000,
      categoryId: strollers,
      brand: "Trailwise",
      ageMinMonths: M(6),
      ageMaxMonths: Y(4),
      stock: 6,
      badge: "bestseller",
      isFeatured: true,
    },
    {
      name: "Ergonomic Baby Carrier",
      slug: "ergonomic-baby-carrier",
      description:
        "Four carry positions with a wide seat that keeps hips in the right shape, and padding that spares your back.",
      details: "Breathable mesh panel · Lumbar support belt · Machine washable",
      price: 9800,
      categoryId: strollers,
      brand: "Trailwise",
      ageMinMonths: M(0),
      ageMaxMonths: M(36),
      stock: 14,
    },
    {
      name: "Adjustable Wooden High Chair",
      slug: "adjustable-wooden-high-chair",
      description:
        "Grows from first purée to sitting at the table properly. Removable tray, wipeable everything.",
      details: "Beech wood · Adjustable seat and footplate · Removable tray · 5-point harness",
      price: 15500,
      categoryId: feeding,
      brand: "Nest & Nook",
      ageMinMonths: M(6),
      ageMaxMonths: Y(8),
      stock: 9,
    },
    {
      name: "Glass Bottle & Steriliser Set",
      slug: "glass-bottle-steriliser-set",
      description:
        "Four borosilicate bottles with slow-flow teats, and an electric steriliser that handles all of them at once.",
      details: "Borosilicate glass · BPA-free teats · 8-minute steam cycle",
      price: 7200,
      categoryId: feeding,
      brand: "Pure Start",
      ageMinMonths: M(0),
      ageMaxMonths: M(18),
      stock: 20,
    },
  ]);

  /* ------------------------------- Hero slides ----------------------------- */
  await db.insert(heroSlides).values([
    {
      eyebrow: "Everything for little ones · 2026",
      title: "Clothing, toys and",
      highlight: "everything between",
      subtitle:
        "Kathmandu's shop for growing families — hand-finished clothing, wooden toys, and nursery gear chosen to last.",
      ctaText: "Shop Everything",
      ctaLink: "/shop",
      image: `${IMG}/hero/hero-1.jpg`,
      sortOrder: 1,
    },
    {
      eyebrow: "Made to keep · Made to pass on",
      title: "Pieces for",
      highlight: "little celebrations",
      subtitle:
        "From first birthdays to festival mornings — clothes and toys that become part of the family album.",
      ctaText: "Shop Party & Occasion",
      ctaLink: "/shop?category=party-occasion",
      image: `${IMG}/hero/hero-2.jpg`,
      sortOrder: 2,
    },
  ]);

  /* ------------------------------ Testimonials ----------------------------- */
  await db.insert(testimonials).values([
    {
      name: "Munni Sunar",
      location: "Kapan, Kathmandu",
      quote:
        "I came in for a romper and left with the stacking rainbow too. Everything is the quality you hope for and rarely find here.",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Anup Karki",
      location: "Kathmandu",
      quote:
        "The balance bike has been the best thing we've bought all year. Our son was riding a proper bicycle within two months.",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Binay Gautam",
      location: "Pokhara",
      quote:
        "Ordered the cot and the bedding set. Packed properly, arrived on time, and the wood is genuinely solid — not the flatpack I feared.",
      rating: 5,
      sortOrder: 3,
    },
    {
      name: "Neha Pradhan",
      location: "Oslo, Norway",
      quote:
        "The festive kurta set is exactly as pictured — the weave, the colour, the fall of the fabric. You can feel the hand behind it.",
      rating: 5,
      sortOrder: 4,
    },
  ]);

  /* -------------------------------- Settings ------------------------------- */
  const settings: Record<string, string> = {
    announcement:
      "Complimentary delivery across Nepal on orders above Rs. 5,000 · Cash on delivery available",
    marquee:
      "Clothing, toys & nursery|Small-batch and hand-finished|Cash on delivery|Gift wrapping on request|Nationwide shipping",
    phone: "+977 980-1087615",
    email: "hello@shrediv.com.np",
    address: "Jyotinagar Pul, Kapan, Kathmandu",
    mapQuery: "Jyotinagar Pul, Kapan, Kathmandu, Nepal",
    hours: "Sunday – Friday · 10:00 – 19:00",
    instagram: "@shre.div",
    aboutTitle: "Everything for little ones, chosen with care",
    aboutBody:
      "Shré~Div began at a single sewing table in Kapan, with one belief: what children wear and play with should be made with real care. We started with clothing — small batches of frocks, rompers and festive wear, each piece finished by hand.\n\nParents kept asking what else we would recommend, so we grew. Today we also stock wooden toys, cots, strollers and feeding gear — every item chosen the way we chose our own fabric: safe, well made, and built to be handed down rather than thrown away.",
    aboutImage: `${IMG}/about/atelier.jpg`,
    gateway1Title: "Clothing",
    gateway1Sub: "Rompers, party frocks & festive wear",
    gateway1Link: "/shop?department=clothing",
    gateway1Image: `${IMG}/editorial/little-ones.jpg`,
    gateway2Title: "Toys & Games",
    gateway2Sub: "Wooden toys, puzzles & ride-ons",
    gateway2Link: "/shop?department=toys",
    gateway2Image: `${IMG}/toys/toys-gateway.jpg`,
    gateway3Title: "Nursery & Gear",
    gateway3Sub: "Cots, strollers & feeding essentials",
    gateway3Link: "/shop?department=nursery",
    gateway3Image: `${IMG}/nursery/nursery-gateway.jpg`,
    bestsellersNote:
      "The pieces parents come back for — restocked in small batches and often gone within the week.",
    newsletterTitle: "First to know when new pieces arrive",
    newsletterBody:
      "Small batches sell out quietly. Join the list for early access to new arrivals, restocks and seasonal offers.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.insert(siteSettings).values({ key, value });
  }

  console.log("Done.");
  process.exit(0);
}

seed();

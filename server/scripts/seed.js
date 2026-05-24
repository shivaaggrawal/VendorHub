require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Category = require("../models/Category.model");
const Product = require("../models/Product.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-vendor-marketplace";

// Unsplash premium image assets for dynamic generation
const ELECTRONICS_IMAGES = [
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"
];

const WEARABLES_IMAGES = [
  "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80",
  "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
  "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80"
];

const AUDIO_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"
];

const FASHION_IMAGES = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"
];

const ACCESSORIES_IMAGES = [
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"
];

const FURNITURE_IMAGES = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&q=80",
  "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80"
];

// Title resources for programmatic expansion (30 unique names per category)
const ELECTRONICS_TITLES = [
  "XenoBook Duo Dual-Screen Laptop",
  "Titan-X Liquid Cooled GPU Node",
  "OmniVibe Neural VR Visor",
  "Quantum Slate Pro Tablet",
  "Vortex Pocket AI Communicator",
  "OmniCore 16-Core Neural Processor",
  "HoloDisplay Curved Screen Monitor",
  "AeroCharge GaN Fast Charger",
  "XenoPad Mechanical Macro Deck",
  "Specter RGB Gaming Console",
  "Synapse AI Accelerator Card",
  "OmniStream Capture Device",
  "Helix Cold-Plate Liquid Cooler",
  "Apex Wireless Charging Dock",
  "Titan SSD Pro 4TB Solid State",
  "XenoNet Wifi 7 Dual Router",
  "OmniKey Low-Profile Keyboard",
  "AeroMouse Ergonomic Clicker",
  "Quantum Vault Ledger Device",
  "Helix Dual-Mic Capture Rig",
  "XenoHub Multi-Port Hub Adapter",
  "OmniGlass Anti-Reflective Screen",
  "AeroStand Aluminum Laptop Stand",
  "Titan Cooling Pad Extreme",
  "Quantum Link Optical Fiber Cable",
  "Vortex Beam Smart Projector",
  "Helix Web3 Secure Hardware Key",
  "OmniPad Wireless Trackpad",
  "AeroCase Hardshell Laptop Bag",
  "XenoDrive Ultra-Speed Flash"
];

const WEARABLES_TITLES = [
  "Aura Smart Bio-Ring Luxe Gold",
  "Aura Smart Bio-Ring Obsidian Black",
  "Chronos Titanium Fit Band",
  "Aegis Specter AR Glasses Lite",
  "MyoGrip Bio-Feedback Tech Gloves",
  "Synapse Active Brainband Tracker",
  "NeuroPulse Premium Sleep Ring",
  "Aura Flex Heart-Rate Strap",
  "Chronos Kinetic Sport Chrono",
  "Aegis Polarized BlueHUD Glasses",
  "MyoSoothe EMG Muscle Massager",
  "Aura Breathe Oxygen Ring",
  "Chronos Aero Carbon Smartwatch",
  "Aegis Vision High-Contrast Specs",
  "Synapse Focus Headband Module",
  "Aura Hydration Bio-Patch",
  "Chronos Classic Luxury Smartwatch",
  "Aegis Sun-Adaptive HUD Sunglasses",
  "NeuroPulse Sleep Harmony Pad",
  "Aura Glow Smart Biometric Ring",
  "Chronos Solar Tactical Watch",
  "Aegis Frame Modular Blue Glasses",
  "MyoActive Wrist Biometer",
  "Synapse Calm Neural Ear-Clips",
  "Aura Recover Thermal Arm Sleeve",
  "Chronos Minimalist Steel Watch",
  "Aegis Wave Bone-Conduction Band",
  "MyoBand Elbow Kinematic Sensor",
  "Aura Vitality Pulse Band",
  "Chronos Summit Rugged Watch"
];

const AUDIO_TITLES = [
  "Acoustix SubZero ANC Over-Ear",
  "Vocalis Pro Studio Podcast Mic",
  "Acoustix SoundSphere 360 Speaker",
  "Aura Buds Micro TWS Plugs",
  "Acoustix Wavecrest Smart Soundbar",
  "Acoustix Pulse Studio IEM Monitors",
  "Vocalis Stream Dual Condenser Mic",
  "Acoustix Shell Compact Speaker",
  "Acoustix Resonate Wood Monitors",
  "Aura Buds Sport Waterproof Plugs",
  "Vocalis Field Wireless Lapel System",
  "Acoustix Air Bone-Conduction Buds",
  "Acoustix OmniSound Portable Speaker",
  "Acoustix Helix XLR Audio Interface",
  "Aura Buds Velvet Comfort Plugs",
  "Vocalis Voice High-Def Shotgun Mic",
  "Acoustix Depth Active Subwoofer",
  "Acoustix Horizon Surround Soundbar",
  "Acoustix Pure Silver Speaker Cables",
  "Aura Buds Crystal ANC Earbuds",
  "Vocalis Boom Arm Studio Mount",
  "Acoustix Shield Acoustic Vocal Booth",
  "Acoustix Pebble Desktop Speakers",
  "Acoustix Node DAC Amplifier",
  "Aura Buds Mini Sleeping Plugs",
  "Vocalis Go USB Lavalier Microphone",
  "Acoustix Echo Retro Bluetooth Speaker",
  "Acoustix Flow Water-Resistant Speaker",
  "Acoustix Link Wireless Audio Sender",
  "Acoustix Solo Dynamic Vocal Mic"
];

const FASHION_TITLES = [
  "NeoThread Shadow Technical Jacket",
  "Volt Runner Carbon V2 Sneakers",
  "NeoThread Phantom Streetwear Hood",
  "Stratus Retro Low White Sneakers",
  "NeoThread Carbon Utility Cargo Pant",
  "VaporMesh Cyber Balaclava Mask",
  "NeoThread Obsidian Cropped Hood",
  "Volt Runner Trail Terrain Sneakers",
  "Kuro Technical Waterproof Shell",
  "NeoThread Minimalist Lounge Jogger",
  "Stratus Vintage Cream Sneakers",
  "VaporMesh Technical Face Mask",
  "NeoThread Structural Knit Hoodie",
  "Volt Runner Speed Track Spikes",
  "Kuro Atelier Tailored Blazer",
  "NeoThread Multi-Pocket Cargo Vest",
  "Stratus Street Leather Sneakers",
  "VaporMesh Anti-Dust Cyber Snood",
  "NeoThread Sunset Gradient Sweatshirt",
  "Volt Runner Platform Chunky Kicks",
  "Kuro Technical Belt-Pack Belt",
  "NeoThread Heavy-Weight Sweatpants",
  "Stratus Court Classic Blue Shoes",
  "VaporMesh Performance Beanie",
  "NeoThread Asymmetric Zip Jacket",
  "Volt Runner Slip-On Mesh Knit",
  "Kuro Technical Modular Harness",
  "NeoThread Retro Fleece Pullover",
  "Stratus Suede Luxury Low Tops",
  "VaporMesh Utility Wrist Wraps"
];

const ACCESSORIES_TITLES = [
  "Kuro Tech Crossbody Sling Pack",
  "Kuro RFID Carbon Fiber Wallet",
  "Apex Dry Roll-Top Duffle Bag",
  "Kuro Modular Tech Storage Pouch",
  "Kuro Sandblasted Leather Desk Mat",
  "Saffiano Technical Passport Cover",
  "Kuro AirTag Premium Leather Holder",
  "Apex Transit Laptop Sleeve",
  "Kuro Stealth Key Organizer",
  "Kuro Minimalist Card Sleeve Wallet",
  "Apex Nomad Travel Duffle",
  "Kuro Cable Organizer Tech Roll",
  "Kuro Premium Leather Coasters",
  "Apex Packable Daypack Backpack",
  "Kuro MagSafe Leather Phone Wallet",
  "Kuro Saffiano Pen Case Holder",
  "Apex Waterproof Wash Bag",
  "Kuro Desk Tray Modular Leather Tray",
  "Kuro Titanium Heavy-Duty Carabiner",
  "Apex Flight Boarding Pass Sleeve",
  "Kuro Slim Bi-Fold Premium Wallet",
  "Kuro Sandblasted Metal Pen",
  "Apex Explorer Waist Belt Pouch",
  "Kuro Technical Watch Strap",
  "Kuro Saffiano Document Folder",
  "Apex Compression Packing Cube Set",
  "Kuro Premium Laptop Sleeve 16",
  "Kuro Pocket Multi-Tool Metallic",
  "Apex Commuter Tech Messenger",
  "Kuro Desk Stand Sandblasted Metal"
];

const FURNITURE_TITLES = [
  "OmniDesk Pro Dual-Motor Sit-Stand",
  "ErgoCentric Premium Task Chair",
  "Kuro Minimalist Walnut Floating Shelf",
  "AeroLux Smart RGB Ambient Beam",
  "Acoustix Hexagonal Acoustic Tiles",
  "OmniLed Intelligent Desktop Bar",
  "OmniDesk Classic Manual Standing Desk",
  "ErgoCentric Comfort Lumbar Seat Cushion",
  "Kuro Bamboo Smart Desk Organizer",
  "AeroLux Corner Flow RGB Light Column",
  "Acoustix Wave Wall Sound Absorber",
  "OmniLed Clamp-On Desk Worklight",
  "OmniDesk Compact Small-Space Desk",
  "ErgoCentric Premium Drafting Stool",
  "Kuro Modular Wooden Monitor Stand",
  "AeroLux Under-Desk LED Lighting Kit",
  "Acoustix Bass Trap Corner Panel",
  "OmniLed Portable Smart Bedside Lamp",
  "OmniDesk Executive L-Shaped Stand Desk",
  "ErgoCentric Executive Leather Desk Chair",
  "Kuro Metal Under-Desk Cable Tray",
  "AeroLux Infinity Mirror Ambient Light",
  "Acoustix Ceiling Sound Cloud Panel",
  "OmniLed Motion-Sensing Drawer Lights",
  "OmniDesk Solid Oak Desktop Slab",
  "ErgoCentric Active Balance Stability Stool",
  "Kuro Floating Headphone Stand Hanger",
  "AeroLux Neon Rope Smart Room Outline",
  "Acoustix Soundproof Desk Divider Screen",
  "OmniLed Smart Dimming Touch Switch"
];

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleaned database.");

    // Create Passwords (let Mongoose pre-save hook hash them once upon User.create)
    const adminPassword = "admin123";
    const sellerPassword = "seller123";
    const buyerPassword = "buyer123";

    // 1. Create Admin
    console.log("Creating Admin...");
    const admin = await User.create({
      name: "System Administrator",
      email: "admin@vendorhub.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    // 2. Create Sellers (Premium Storefronts)
    console.log("Creating Premium Vendors...");
    const sellers = await User.create([
      {
        name: "Acoustix AI Labs",
        email: "acoustix@seller.com",
        password: sellerPassword,
        role: "seller",
        isVendorApproved: true,
        storeName: "Acoustix AI Labs",
        storeDescription: "Next-generation intelligent audio systems, neural noise-cancelling equipment, and wearable speakers.",
        vendorLocation: "Colaba, Mumbai",
        isActive: true,
      },
      {
        name: "OmniTech Gear",
        email: "omnitech@seller.com",
        password: sellerPassword,
        role: "seller",
        isVendorApproved: true,
        storeName: "OmniTech Systems",
        storeDescription: "Premium computing systems, high-performance gaming gear, smartphones, and futuristic smart gadgets.",
        vendorLocation: "Andheri, Mumbai",
        isActive: true,
      },
      {
        name: "NeoThread Streetwear",
        email: "neothread@seller.com",
        password: sellerPassword,
        role: "seller",
        isVendorApproved: true,
        storeName: "NeoThread Studio",
        storeDescription: "Cinematic fashion-tech, high-contrast streetwear, structural hoodies, and premium footwear.",
        vendorLocation: "Bandra, Mumbai",
        isActive: true,
      },
      {
        name: "Aura Wearables",
        email: "aurawear@seller.com",
        password: sellerPassword,
        role: "seller",
        isVendorApproved: true,
        storeName: "Aura Biologicals",
        storeDescription: "Intelligent health trackers, smart biological rings, and tactical bio-monitoring equipment.",
        vendorLocation: "Powai, Mumbai",
        isActive: true,
      },
      {
        name: "Kuro Atelier & Bags",
        email: "kuro@seller.com",
        password: sellerPassword,
        role: "seller",
        isVendorApproved: true,
        storeName: "Kuro Atelier",
        storeDescription: "Minimalist leather carryalls, water-impermeable technical packs, and smart storage units.",
        vendorLocation: "Juhu, Mumbai",
        isActive: true,
      }
    ]);

    // 3. Create Buyers for Realistic Reviews
    console.log("Creating Verified Buyer Accounts...");
    const buyers = await User.create([
      { name: "Alex Carter", email: "alex@buyer.com", password: buyerPassword, role: "buyer", isActive: true },
      { name: "Sophia Chen", email: "sophia@buyer.com", password: buyerPassword, role: "buyer", isActive: true },
      { name: "Marcus Vance", email: "marcus@buyer.com", password: buyerPassword, role: "buyer", isActive: true },
      { name: "Elena Rostova", email: "elena@buyer.com", password: buyerPassword, role: "buyer", isActive: true },
      { name: "Kai Tanaka", email: "kai@buyer.com", password: buyerPassword, role: "buyer", isActive: true }
    ]);

    // 4. Create Categories
    console.log("Creating Core Categories...");
    const categoriesData = [
      {
        name: "Electronics",
        description: "Supercomputing rigs, gaming laptops, premium smartphones, and performance peripherals.",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
      },
      {
        name: "Wearables",
        description: "Intelligent biometric rings, high-fidelity fitness smartwatches, and augmented vision glasses.",
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80"
      },
      {
        name: "Audio",
        description: "Neural active noise-cancelling headphones, high-resolution monitors, and intelligent soundpods.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
      },
      {
        name: "Fashion",
        description: "Cyberpunk street style, structural outerwear, premium performance techwear, and high-traction sneakers.",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"
      },
      {
        name: "Accessories",
        description: "Premium leather goods, high-durability backpacks, modular cases, and travel companions.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
      },
      {
        name: "Furniture & Home",
        description: "Ergonomic command consoles, motorized sit-stand desks, premium orthopedic task chairs, and smart home units.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
      }
    ];

    const categories = {};
    for (const cat of categoriesData) {
      const created = await Category.create({
        name: cat.name,
        description: cat.description,
        image: {
          public_id: "cloudinary_cat",
          url: cat.image
        }
      });
      categories[cat.name] = created._id;
    }

    // Helpers to reference IDs
    const acoustix = sellers[0]._id;
    const omnitech = sellers[1]._id;
    const neothread = sellers[2]._id;
    const aura = sellers[3]._id;
    const kuro = sellers[4]._id;

    console.log("Seeding Premium Custom-Curated Products...");

    const productsData = [
      // ────────── ELECTRONICS: SMARTPHONES ──────────
      {
        title: "Vortex Pro 17 Augmented Smartphone",
        description: "Experience the zenith of mobile computing. Powered by a 3nm neural processing unit, the Vortex Pro 17 features an ultra-bright holographic OLED panel, 100x macro optical drop lens, and integrated Web3 security protocols. Engineered with a matte obsidian titanium frame.",
        price: 1199,
        discountedPrice: 1399,
        stock: 35,
        category: categories["Electronics"],
        subcategory: "Smartphones",
        images: [
          { public_id: "phone1_1", url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80" },
          { public_id: "phone1_2", url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["smartphone", "iphone", "phone", "mobile", "ios", "vortex", "android", "device"],
        synonyms: ["smartphone", "iphone", "android", "phone", "mobile phone", "cellular", "ios device", "handset"],
        trendingTags: ["trending", "cyberdrop", "featured"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[0]._id, rating: 5, comment: "Absolutely futuristic. The camera lens magnification is gorgeous and fits my tech look perfectly." },
          { user: buyers[1]._id, rating: 5, comment: "Incredible battery and a screen that looks like it is floating in air. Best purchase this year!" }
        ]
      },
      {
        title: "Aero X14 Titanium Foldable Phone",
        description: "The next evolution of cellular devices. The Aero X14 folds out from a sleek, palm-sized bar into a brilliant 8.2-inch ultra-thin glass workspace. Designed for ultimate mobile productivity, running custom secure localized AI nodes on-device.",
        price: 1699,
        discountedPrice: 1899,
        stock: 15,
        category: categories["Electronics"],
        subcategory: "Smartphones",
        images: [
          { public_id: "phone2_1", url: "https://images.unsplash.com/photo-1565849906461-0ee123529fa0?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["smartphone", "android", "phone", "mobile", "foldable", "aero", "google"],
        synonyms: ["smartphone", "android phone", "foldable phone", "phone", "mobile phone", "handset", "cellphone"],
        trendingTags: ["trending", "featured"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[2]._id, rating: 4, comment: "Amazing folding screen, though a bit heavy in pocket. Highly recommended for heavy multi-taskers." }
        ]
      },
      {
        title: "NeonGrid Zero Cyberpunk Mobile Handset",
        description: "Embody the dark streetwear aesthetic. High contrast orange grid casing under a matte-black chassis. Outfitted with high refresh rate tactile gamepads, liquid cooling, and optimized firmware for seamless low-latency cloud gaming.",
        price: 899,
        discountedPrice: 999,
        stock: 22,
        category: categories["Electronics"],
        subcategory: "Smartphones",
        images: [
          { public_id: "phone3_1", url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["smartphone", "phone", "mobile", "gaming", "neon", "cyberpunk", "android"],
        synonyms: ["smartphone", "iphone", "android", "phone", "mobile", "cellphone", "gaming phone", "cyber phone"],
        trendingTags: ["cyberdrop"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[3]._id, rating: 5, comment: "This fits my cyber streetwear vibes 100%. The side-mounted bumpers feel incredible when gaming." }
        ]
      },

      // ────────── ELECTRONICS: LAPTOPS ──────────
      {
        title: "Zephyrus X9 Carbon Gaming Laptop",
        description: "Command absolute computing dominion. Housing a liquid-metal cooled 24-core processor, an RTX 5090 graphics node, and a true 240Hz dual-mode OLED screen. Enclosed within a zero-flex aerospace carbon composite unibody.",
        price: 3499,
        discountedPrice: 3899,
        stock: 12,
        category: categories["Electronics"],
        subcategory: "Laptops",
        images: [
          { public_id: "laptop1_1", url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80" },
          { public_id: "laptop1_2", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["laptop", "gaming", "notebook", "pc", "computer", "zephyrus", "ultrabook", "nvidia"],
        synonyms: ["laptop", "notebook", "ultrabook", "gaming laptop", "computer", "pc", "rig", "portable computer", "macbook"],
        trendingTags: ["trending", "featured"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[4]._id, rating: 5, comment: "Unbelievable power. Rendered my entire Blender sequence in minutes, and does not even break a sweat." }
        ]
      },
      {
        title: "Aura Slim Ultrabook 14",
        description: "Designed for elite creators and developers. Weighing under 1.9 lbs, this featherlight computing unit features a beautiful 3.5K color-accurate infinity display, silent fanless thermal system, and up to 26 hours of compilation battery life.",
        price: 1499,
        discountedPrice: 1650,
        stock: 30,
        category: categories["Electronics"],
        subcategory: "Laptops",
        images: [
          { public_id: "laptop2_1", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["laptop", "ultrabook", "notebook", "pc", "computer", "macbook", "minimalist"],
        synonyms: ["laptop", "notebook", "ultrabook", "thin laptop", "light computer", "pc", "macbook clone"],
        trendingTags: ["featured"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[0]._id, rating: 5, comment: "It weighs almost nothing! Excellent keyboard feel and stellar trackpad. Extremely premium." }
        ]
      },
      {
        title: "KuroBook Developer Command Station",
        description: "Built for cryptographers, security engineers, and full stack builders. Outfitted with physical hardware-kill switches for cameras/mics, a self-encrypting enterprise SSD stack, and pre-configured terminal tools inside a black sandblasted enclosure.",
        price: 2199,
        stock: 18,
        category: categories["Electronics"],
        subcategory: "Laptops",
        images: [
          { public_id: "laptop3_1", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["laptop", "computer", "notebook", "pc", "developer", "kurobook"],
        synonyms: ["laptop", "notebook", "ultrabook", "developer pc", "computer", "workstation"],
        trendingTags: ["cyberdrop"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[1]._id, rating: 5, comment: "The hardware killswitches give complete peace of mind. Excellent Linux support out of the box." }
        ]
      },

      // ────────── ELECTRONICS: ACCESSORIES ──────────
      {
        title: "CyberGrid Mechanical Keyboard",
        description: "An ultra-premium, CNC-machined aluminum mechanical keyboard. Hot-swappable tactile switches factory lubed, sound dampening foam, translucent keycaps with interactive custom lighting, and a customizable media control ring.",
        price: 249,
        stock: 50,
        category: categories["Electronics"],
        subcategory: "Gaming Accessories",
        images: [
          { public_id: "kb1", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["keyboard", "gaming", "mechanical", "clicky", "grid", "rgb", "accessory"],
        synonyms: ["keyboard", "gaming keyboard", "mechanical keyboard", "switches", "computer typing input"],
        trendingTags: ["trending"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[2]._id, rating: 5, comment: "Sounds like rain typing on premium mahogany. The aluminum chassis is built like a tank." }
        ]
      },
      {
        title: "Oracle Pro RGB Gaming Mouse",
        description: "Zero-latency 8000Hz polling rate wireless optical mouse. Equipped with a breakthrough 46,000 DPI sensor, high durability optical switches, and customizable dynamic glowing side wings.",
        price: 149,
        discountedPrice: 179,
        stock: 65,
        category: categories["Electronics"],
        subcategory: "Gaming Accessories",
        images: [
          { public_id: "mouse1", url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80" }
        ],
        sellerId: omnitech,
        tags: ["mouse", "gaming", "oracle", "rgb", "wireless", "accessory"],
        synonyms: ["mouse", "gaming mouse", "pointer", "trackpad", "gaming clicker"],
        trendingTags: ["featured"],
        vendorLocation: "Tokyo, Japan",
        reviews: [
          { user: buyers[3]._id, rating: 5, comment: "Extremely lightweight and fast. The glide feet feel like they are floating on ice." }
        ]
      },

      // ────────── WEARABLES ──────────
      {
        title: "Aura Smart Bio-Ring Gen 3",
        description: "The ultimate wellness tracker hidden in plain sight. Sculpted from premium zirconia ceramic with micro-sensors that measure heart rate variability, blood oxygen, sleep phases, and stress scores 24/7. Completely waterproof up to 100m.",
        price: 299,
        discountedPrice: 349,
        stock: 40,
        category: categories["Wearables"],
        subcategory: "Smart Rings",
        images: [
          { public_id: "ring1", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" }
        ],
        sellerId: aura,
        tags: ["ring", "smart ring", "aura", "wearable", "biometrics", "health", "fitness"],
        synonyms: ["ring", "smart ring", "finger tracker", "wearable monitor", "fitness band"],
        trendingTags: ["trending", "cyberdrop", "featured"],
        vendorLocation: "Geneva, Switzerland",
        reviews: [
          { user: buyers[4]._id, rating: 5, comment: "Elegant, discreet, and holds a charge for 8 whole days. Much better than a heavy smartwatch!" }
        ]
      },
      {
        title: "Chronos AI Fitness Watch Pro",
        description: "A luxury smartwatch blending classic horology with advanced artificial intelligence. Includes localized offline coaching analytics, continuous health logs, active GPS, and a beautiful tactile physical control bezel.",
        price: 499,
        discountedPrice: 599,
        stock: 25,
        category: categories["Wearables"],
        subcategory: "Smartwatches",
        images: [
          { public_id: "watch1", url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80" }
        ],
        sellerId: aura,
        tags: ["watch", "smartwatch", "chronos", "wearable", "fitness", "gps", "health"],
        synonyms: ["watch", "smartwatch", "fitness tracker", "chronograph", "wrist band", "timepiece"],
        trendingTags: ["trending"],
        vendorLocation: "Geneva, Switzerland",
        reviews: [
          { user: buyers[0]._id, rating: 4, comment: "Stunning aesthetic. The titanium bezel fits my techwear style, but the app sync could be faster." }
        ]
      },
      {
        title: "Aegis Smart Bio-Glasses",
        description: "Augmented reality specs built for high-contrast living. Projects navigation data, notification overlays, and ambient light filtration indices directly onto custom blue-light polarized lenses.",
        price: 599,
        stock: 15,
        category: categories["Wearables"],
        subcategory: "Smart Glasses",
        images: [
          { public_id: "glasses1", url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80" }
        ],
        sellerId: aura,
        tags: ["glasses", "wearable", "ar", "glasses", "aegis", "smart sunglasses", "hud"],
        synonyms: ["glasses", "smart glasses", "augmented reality specs", "spectacles", "ar shades"],
        trendingTags: ["cyberdrop"],
        vendorLocation: "Geneva, Switzerland",
        reviews: [
          { user: buyers[1]._id, rating: 5, comment: "I feel like a cyborg walking down Tokyo streets with the HUD active. Absolutely gorgeous design." }
        ]
      },

      // ────────── AUDIO ──────────
      {
        title: "Neural Noise-Cancelling Headphones ANC-1",
        description: "Block the digital noise and immerse in master-quality sound. Featuring dual-core processors mapping ambient sounds 1000 times a second to generate a zone of absolute silent bliss. Engineered with memory foam wrapped in high-quality vegan leather.",
        price: 349,
        discountedPrice: 399,
        stock: 30,
        category: categories["Audio"],
        subcategory: "Headphones",
        images: [
          { public_id: "audio1_1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
          { public_id: "audio1_2", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80" }
        ],
        sellerId: acoustix,
        tags: ["headphones", "audio", "noise cancelling", "anc", "acoustix", "wireless", "headset"],
        synonyms: ["headphones", "noise cancelling headphones", "earphones", "headset", "audio listeners", "over ear headphones"],
        trendingTags: ["trending", "featured"],
        vendorLocation: "California, USA",
        reviews: [
          { user: buyers[2]._id, rating: 5, comment: "The ANC is magical. It completely erases the drone of my subway commute." }
        ]
      },
      {
        title: "Vocalis High-Resolution Studio Monitors",
        description: "For audiophiles who demand spatial purity. Hand-tuned physical transducers delivering incredibly deep, uncolored bass response and soaring highs. Ideal for mixing, composing, or cinematic playback.",
        price: 899,
        stock: 10,
        category: categories["Audio"],
        subcategory: "Speakers",
        images: [
          { public_id: "audio2_1", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80" }
        ],
        sellerId: acoustix,
        tags: ["speakers", "monitors", "audio", "high-res", "vocalis", "studio"],
        synonyms: ["speakers", "studio monitors", "audio speakers", "soundbox", "amplifiers"],
        trendingTags: ["featured"],
        vendorLocation: "California, USA",
        reviews: [
          { user: buyers[3]._id, rating: 5, comment: "I hear instruments in my favorite soundtracks that I never knew existed before. Phenomenal." }
        ]
      },
      {
        title: "Aura TWS Noise-Free Earbuds",
        description: "Ultralight, secure-fit true wireless earbuds. Includes smart sweat protection, intuitive gesture side controls, custom sound profile mapping via on-device AI tuning, and a rapid magnetic charging cradle.",
        price: 189,
        discountedPrice: 220,
        stock: 55,
        category: categories["Audio"],
        subcategory: "Earbuds",
        images: [
          { public_id: "audio3_1", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80" }
        ],
        sellerId: acoustix,
        tags: ["earbuds", "tws", "earphones", "audio", "acoustix", "wireless"],
        synonyms: ["earbuds", "wireless earphones", "tws plugs", "earphones", "noise cancelling earbuds"],
        trendingTags: ["trending"],
        vendorLocation: "California, USA",
        reviews: [
          { user: buyers[4]._id, rating: 5, comment: "They never fall out during high-speed runs. The charging case is sleek and robust." }
        ]
      },

      // ────────── FASHION: HOODIES ──────────
      {
        title: "Obscura Technical Structural Hoodie",
        description: "Redefine your structural fashion footprint. Built from a heavy 520gsm loopback cotton blend with structural paneling, windproof outer treatment, water-impermeable zipper storage nodes, and an deep wrap hood. Matte black premium streetwear aesthetic.",
        price: 185,
        discountedPrice: 220,
        stock: 45,
        category: categories["Fashion"],
        subcategory: "Hoodies",
        images: [
          { public_id: "hoodie1_1", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80" },
          { public_id: "hoodie1_2", url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["hoodie", "fashion", "techwear", "streetwear", "obscura", "apparel", "clothing"],
        synonyms: ["hoodie", "sweatshirt", "techwear jacket", "streetwear top", "apparel", "clothing", "hooded sweater"],
        trendingTags: ["trending", "cyberdrop", "featured"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[0]._id, rating: 5, comment: "The silhouette of this hoodie is magnificent. It maintains its shape and looks incredibly futuristic." },
          { user: buyers[1]._id, rating: 5, comment: "Sturdy fabric, smart zippers, and waterproof! Perfect for dark streetwear shoots." }
        ]
      },
      {
        title: "Kuro Atelier Structural Windbreaker",
        description: "An editorial outerwear statement. Crafted from double-face technical membrane weave that completely blocks wind and moisture while ensuring internal vapor dispersion. Accented with subtle matte brass toggles.",
        price: 295,
        stock: 20,
        category: categories["Fashion"],
        subcategory: "Hoodies",
        images: [
          { public_id: "hoodie2_1", url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["hoodie", "fashion", "techwear", "windbreaker", "kuro", "clothing", "apparel"],
        synonyms: ["hoodie", "jacket", "windbreaker", "outerwear", "clothing", "streetwear coat"],
        trendingTags: ["cyberdrop"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[2]._id, rating: 5, comment: "Highly functional and looks like dynamic sculpture when worn. Standard setting technical jacket." }
        ]
      },
      {
        title: "Champagne Cream Oversized Knit Hoodie",
        description: "Relaxed elegance meet futuristic street comfort. Heavily woven champagne cotton loop knit with raw-edge detailing, relaxed drop shoulders, and a structural front pouch layered with integrated media routing ports.",
        price: 165,
        discountedPrice: 195,
        stock: 35,
        category: categories["Fashion"],
        subcategory: "Hoodies",
        images: [
          { public_id: "hoodie3_1", url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["hoodie", "fashion", "cream", "oversized", "streetwear", "apparel", "clothing"],
        synonyms: ["hoodie", "sweatshirt", "knit sweater", "oversized jumper", "clothing", "apparel"],
        trendingTags: ["featured"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[3]._id, rating: 5, comment: "Super soft ivory texture that fits the marketplace color palette nicely. Extremely comfortable." }
        ]
      },

      // ────────── FASHION: SNEAKERS ──────────
      {
        title: "Volt Runner Carbon Sneakers",
        description: "Engineered to push human kinetics. Integrates a lightweight custom carbon-fiber launch plate under a nitrogen-infused responsive foam bed. The outer skin is formed from continuous breathable TPU filament.",
        price: 210,
        discountedPrice: 250,
        stock: 40,
        category: categories["Fashion"],
        subcategory: "Shoes",
        images: [
          { public_id: "shoe1_1", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
          { public_id: "shoe1_2", url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["shoes", "sneakers", "runners", "fashion", "volt", "nike", "footwear"],
        synonyms: ["shoes", "sneakers", "running shoes", "footwear", "kicks", "athletic footwear", "trainers"],
        trendingTags: ["trending", "featured"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[4]._id, rating: 5, comment: "Feels like bouncing on mini trampolines! My sprint speeds improved instantly." }
        ]
      },
      {
        title: "Kuro Eclipse High-Top Sneakers",
        description: "Dark luxury technical sneakers for urban terrain. Features a dual-zipper speed lacing architecture, rugged Vibram outsole panels, and a waterproof technical lining. The aesthetic is matte black with a subtle champagne cream highlight.",
        price: 285,
        stock: 18,
        category: categories["Fashion"],
        subcategory: "Shoes",
        images: [
          { public_id: "shoe2_1", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["shoes", "sneakers", "high-top", "techwear", "kuro", "footwear"],
        synonyms: ["shoes", "sneakers", "high tops", "streetwear shoes", "footwear", "boots"],
        trendingTags: ["cyberdrop"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[0]._id, rating: 5, comment: "Stunning design that gets compliments everywhere. Built extremely rugged." }
        ]
      },
      {
        title: "Stratus White Retro Sneakers",
        description: "Classic court silhouettes updated for modern luxury. Made from hand-cut Italian grain leather, built with reinforced structural stitching, and finished with a comfortable memory foam footbed.",
        price: 175,
        discountedPrice: 210,
        stock: 30,
        category: categories["Fashion"],
        subcategory: "Shoes",
        images: [
          { public_id: "shoe3_1", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" }
        ],
        sellerId: neothread,
        tags: ["shoes", "sneakers", "white", "retro", "leather", "footwear"],
        synonyms: ["shoes", "sneakers", "trainers", "tennis shoes", "footwear", "leather kicks"],
        trendingTags: ["featured"],
        vendorLocation: "Seoul, South Korea",
        reviews: [
          { user: buyers[1]._id, rating: 4, comment: "Very clean look. Goes with literally any denim or tech cargo pant." }
        ]
      },

      // ────────── ACCESSORIES: BAGS ──────────
      {
        title: "Apex Waterproof Roll-Top Pack",
        description: "The ultimate technical backpack. Fully radio-frequency welded seams that create a completely water-impermeable capsule. Features a suspended laptop harness sleeve, tactical compression webbing, and a hidden quick-access tech drawer.",
        price: 245,
        discountedPrice: 295,
        stock: 25,
        category: categories["Accessories"],
        subcategory: "Bags",
        images: [
          { public_id: "bag1_1", url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80" }
        ],
        sellerId: kuro,
        tags: ["bag", "backpack", "waterproof", "techwear", "apex", "travel", "accessory"],
        synonyms: ["bag", "backpack", "pack", "rucksack", "travel bag", "duffel", "laptop carryall", "knapsack"],
        trendingTags: ["trending", "cyberdrop", "featured"],
        vendorLocation: "Paris, France",
        reviews: [
          { user: buyers[2]._id, rating: 5, comment: "I commuted through a torrential rainstorm in London and everything inside stayed bone dry." }
        ]
      },
      {
        title: "Nomad Saffiano Leather Briefcase",
        description: "Crafted for global executives and digital creators. Heavy Saffiano cross-grain leather that repels scratches and moisture. Features micro-suede velvet interior lining, solid brass zippers, and custom compartments for smartphones, cards, and chargers.",
        price: 380,
        stock: 12,
        category: categories["Accessories"],
        subcategory: "Bags",
        images: [
          { public_id: "bag2_1", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" }
        ],
        sellerId: kuro,
        tags: ["bag", "briefcase", "leather", "nomad", "business", "accessory"],
        synonyms: ["bag", "briefcase", "handbag", "purse", "leather portfolio", "carry case"],
        trendingTags: ["featured"],
        vendorLocation: "Paris, France",
        reviews: [
          { user: buyers[3]._id, rating: 5, comment: "Impeccable structural lines and stitch quality. Smells like rich leather and coordinates with my business look." }
        ]
      },
      {
        title: "Kuro Modular Utility Sling",
        description: "A compact crossbody sling designed for modern light-carry necessities. Built from high-tenacity ballistic nylon, utilizing magnetic fidlock buckles, and expandable storage sleeves for everyday active carries.",
        price: 95,
        discountedPrice: 120,
        stock: 50,
        category: categories["Accessories"],
        subcategory: "Bags",
        images: [
          { public_id: "bag3_1", url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80" }
        ],
        sellerId: kuro,
        tags: ["bag", "sling", "modular", "nylon", "kuro", "crossbody", "accessory"],
        synonyms: ["bag", "sling bag", "pouch", "fanny pack", "waist pack", "crossbody case"],
        trendingTags: ["trending"],
        vendorLocation: "Paris, France",
        reviews: [
          { user: buyers[4]._id, rating: 5, comment: "My daily driver. Fits my keys, wallet, phone, and biological ring comfortably." }
        ]
      }
    ];

    // ─── Programmatic Generation ───
    console.log("Generating 60 high-fidelity products in every core category (360 total additional products)...");
    
    const generateCategoryProducts = (catName, catId, sellerId, vendorLocation, titles, subcategories, imageList, baseDesc, basePrice, subTags) => {
      const generated = [];
      for (let i = 0; i < 60; i++) {
        const title = titles[i % titles.length] + (i >= titles.length ? ` V${Math.floor(i / titles.length) + 1}` : "");
        const subcategory = subcategories[i % subcategories.length];
        const rawPrice = basePrice + (i * 12) + (i % 3 === 0 ? 0.99 : 0.50);
        const price = Math.round(rawPrice * 83);
        const originalPrice = i % 2 === 0 ? Math.round((rawPrice + 50) * 83) : 0;
        const stock = 10 + (i * 2) % 45;
        
        // Pick an image
        const imgUrl = imageList[i % imageList.length];
        const images = [
          { public_id: `gen_${catName.toLowerCase().slice(0, 3)}_${i}`, url: imgUrl }
        ];

        // Custom realistic premium descriptions
        const features = [
          "Outfitted with cutting-edge micro-sensors and a high-durability carbon-composite framework.",
          "Designed for absolute performance and long-lasting durability in professional environments.",
          "Features our signature dark minimalist design language with warm champagne accents.",
          "Integrates seamlessly with all other products in the premium marketplace collection.",
          "Hand-assembled and individually certified to meet strict quality and environmental standards.",
          "Utilizes bio-compatible aerospace titanium alloy for structural resilience and lightweight utility."
        ];
        
        const description = `${title} represents the pinnacle of ${subcategory.toLowerCase()} innovation. ${baseDesc} ${features[i % features.length]} Offers unparalleled user experiences and exceptional engineering.`;

        // Standard tags and synonyms
        const tags = [subcategory.toLowerCase(), catName.toLowerCase(), ...subTags, "premium", "new"];
        const synonyms = [subcategory.toLowerCase(), catName.toLowerCase(), ...subTags];
        const trendingTags = i % 5 === 0 ? ["trending"] : i % 7 === 0 ? ["cyberdrop"] : ["featured"];

        // Reviews
        const productReviews = [];
        const reviewsCount = 1 + (i % 3); // 1 to 3 reviews
        for (let r = 0; r < reviewsCount; r++) {
          const buyer = buyers[r % buyers.length];
          const comments = [
            "Extremely premium feel, lives up to the reputation completely.",
            "Absolutely beautiful design, fits my daily setup beautifully.",
            "Highly functional and exceptionally high quality. Deserves five stars!",
            "Exceeded my expectations. Build quality is top-notch and looks amazing.",
            "Decent performance, very high-end finish and premium packaging."
          ];
          productReviews.push({
            user: buyer._id,
            rating: 4 + (r % 2), // 4 or 5 stars
            comment: comments[(i + r) % comments.length]
          });
        }

        generated.push({
          title,
          description,
          price,
          discountedPrice: originalPrice,
          stock,
          category: catId,
          subcategory,
          images,
          sellerId,
          tags,
          synonyms,
          trendingTags,
          vendorLocation,
          reviews: productReviews
        });
      }
      return generated;
    };

    // Generate for all 6 categories
    const genElectronics = generateCategoryProducts(
      "Electronics", categories["Electronics"], omnitech, "Andheri, Mumbai",
      ELECTRONICS_TITLES, ["Smartphones", "Laptops", "Gaming Accessories", "AI Gadgets"], ELECTRONICS_IMAGES,
      "Experience elite computing capabilities, advanced thermal regulation, and high refresh rate visual engines.", 499,
      ["electronics", "device", "pc", "tech"]
    );

    const genWearables = generateCategoryProducts(
      "Wearables", categories["Wearables"], aura, "Powai, Mumbai",
      WEARABLES_TITLES, ["Smart Rings", "Smartwatches", "Smart Glasses", "Bio-Sensors"], WEARABLES_IMAGES,
      "Intelligent biometric monitoring in a luxury, lightweight body. Active GPS, stress tracking, and continuous health telemetry.", 199,
      ["wearable", "health", "smart", "fitness"]
    );

    const genAudio = generateCategoryProducts(
      "Audio", categories["Audio"], acoustix, "Colaba, Mumbai",
      AUDIO_TITLES, ["Headphones", "Speakers", "Earbuds", "Microphones"], AUDIO_IMAGES,
      "Immersive spatial sound mapping with neural active noise cancellation. Deliver crystal clear high-fidelity acoustics.", 129,
      ["audio", "sound", "music", "anc"]
    );

    const genFashion = generateCategoryProducts(
      "Fashion", categories["Fashion"], neothread, "Bandra, Mumbai",
      FASHION_TITLES, ["Hoodies", "Shoes", "Jackets", "Cargos"], FASHION_IMAGES,
      "High-contrast street silhouette engineered from double-woven technical fibers. Water-impermeable zippers and premium styling.", 89,
      ["fashion", "streetwear", "clothing", "apparel"]
    );

    const genAccessories = generateCategoryProducts(
      "Accessories", categories["Accessories"], kuro, "Juhu, Mumbai",
      ACCESSORIES_TITLES, ["Bags", "Wallets", "Cases", "Travel Accessories"], ACCESSORIES_IMAGES,
      "Minimalist functional design handcrafted from high-tensility ballistic nylon and scratch-resistant Saffiano leather.", 49,
      ["accessories", "bag", "leather", "travel"]
    );

    const genFurniture = generateCategoryProducts(
      "Furniture & Home", categories["Furniture & Home"], omnitech, "Andheri, Mumbai",
      FURNITURE_TITLES, ["Desks", "Chairs", "Lighting", "Smart Storage"], FURNITURE_IMAGES,
      "Ergonomically engineered command hardware. Clean structural lines designed to elevate your creative workspace comfort.", 149,
      ["furniture", "home", "desk", "office"]
    );

    // Transform manual productsData to INR and Mumbai locations dynamically
    const locationMap = {
      "California, USA": "Colaba, Mumbai",
      "Tokyo, Japan": "Andheri, Mumbai",
      "Seoul, South Korea": "Bandra, Mumbai",
      "Geneva, Switzerland": "Powai, Mumbai",
      "Paris, France": "Juhu, Mumbai"
    };

    productsData.forEach(p => {
      // 1. Convert Price to INR
      p.price = Math.round(p.price * 83);
      if (p.discountedPrice) {
        p.discountedPrice = Math.round(p.discountedPrice * 83);
      }
      // 2. Map Location to Mumbai
      if (p.vendorLocation && locationMap[p.vendorLocation]) {
        p.vendorLocation = locationMap[p.vendorLocation];
      }
      // 3. Localize specific review references
      if (p.reviews && p.reviews.length > 0) {
        p.reviews.forEach(r => {
          if (r.comment && r.comment.includes("Tokyo streets")) {
            r.comment = r.comment.replace("Tokyo streets", "Bandra streets");
          }
        });
      }
    });

    // Combine manual and programmatically generated items
    const allProductsToSeed = [
      ...productsData,
      ...genElectronics,
      ...genWearables,
      ...genAudio,
      ...genFashion,
      ...genAccessories,
      ...genFurniture
    ];

    // Compute average ratings and numReviews for all seeded items to be 100% correct
    allProductsToSeed.forEach(p => {
      if (p.reviews && p.reviews.length > 0) {
        const total = p.reviews.reduce((sum, r) => sum + r.rating, 0);
        p.averageRating = Math.round((total / p.reviews.length) * 10) / 10;
        p.numReviews = p.reviews.length;
      } else {
        p.averageRating = 0;
        p.numReviews = 0;
      }
    });

    console.log(`Writing ${allProductsToSeed.length} total products to database...`);
    await Product.create(allProductsToSeed);
    
    console.log("Successfully seeded database with premium storefronts, users, categories, and high-fidelity products!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedData();

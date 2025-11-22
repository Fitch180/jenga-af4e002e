export const CATEGORIES = [
  "All",
  "ARCHITECTS",
  "ENGINEERS",
  "CONTRACTORS",
  "BUILDING",
  "PLUMBING",
  "FLOORING",
  "ELECTRICAL",
  "PAINTING",
  "TILES",
  "FURNITURE",
  "LIGHTING",
  "DECOR",
  "GARDENING",
  "REPAIR",
];

export const MERCHANTS = [
  { id: 1, name: "Dar Ceramica Center", location: "Mikocheni", category: "TILES", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop" },
  { id: 2, name: "ABC Emporio Tiles Tanzania", location: "Industrial Way Rd", category: "TILES", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop" },
  { id: 3, name: "Elite Hardware Supplies", location: "Msasani", category: "BUILDING", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=400&fit=crop" },
  { id: 4, name: "Modern Living Furniture", location: "Masaki", category: "FURNITURE", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop" },
  { id: 5, name: "Bright Lights Tanzania", location: "Oysterbay", category: "LIGHTING", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: 6, name: "Perfect Paint Solutions", location: "Kinondoni", category: "PAINTING", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&h=400&fit=crop" },
  { id: 7, name: "Premier Plumbing Services", location: "Kariakoo", category: "PLUMBING", image: "https://images.unsplash.com/photo-1600607686532-37e545c1e101?w=400&h=400&fit=crop" },
  { id: 8, name: "FloorMaster Tanzania", location: "Ubungo", category: "FLOORING", image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=400&fit=crop" },
  { id: 9, name: "Power Electric Co.", location: "Sinza", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=400&fit=crop" },
  { id: 10, name: "Green Garden Services", location: "Mbezi Beach", category: "GARDENING", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop" },
  { id: 11, name: "Quick Fix Repair", location: "Tegeta", category: "REPAIR", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=400&fit=crop" },
  { id: 12, name: "Decor Dreams", location: "Mikocheni", category: "DECOR", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: 13, name: "BuildPro Contractors", location: "Kimara", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=400&fit=crop" },
  { id: 14, name: "ArchDesign Studio", location: "Masaki", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=400&h=400&fit=crop" },
  { id: 15, name: "Structural Engineers Ltd", location: "City Center", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=400&fit=crop" },
  { id: 16, name: "Luxury Furnishings", location: "Oysterbay", category: "FURNITURE", image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=400&fit=crop" },
  { id: 17, name: "Tile World Tanzania", location: "Mwenge", category: "TILES", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: 18, name: "Elegant Lighting Design", location: "Masaki", category: "LIGHTING", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop" },
  { id: 19, name: "Home Builders Co.", location: "Goba", category: "BUILDING", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop" },
  { id: 20, name: "Garden Paradise", location: "Mbezi Beach", category: "GARDENING", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop" },
];

export const PRODUCTS = [
  // Dar Ceramica Center products (id: 1)
  { id: "1", merchantId: 1, name: "Light Lamp Shades", merchant: "Dar Ceramica Center", price: "25,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
  { id: "2", merchantId: 1, name: "Ceramic Floor Tiles", merchant: "Dar Ceramica Center", price: "35,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop" },
  { id: "3", merchantId: 1, name: "Wall Tiles Premium", merchant: "Dar Ceramica Center", price: "45,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607688960-e095ff83135c?w=400&h=400&fit=crop" },
  { id: "4", merchantId: 1, name: "Bathroom Tiles Set", merchant: "Dar Ceramica Center", price: "55,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: "5", merchantId: 1, name: "Kitchen Backsplash Tiles", merchant: "Dar Ceramica Center", price: "40,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop" },
  { id: "6", merchantId: 1, name: "Outdoor Tiles", merchant: "Dar Ceramica Center", price: "50,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=400&fit=crop" },
  
  // ABC Emporio products (id: 2)
  { id: "7", merchantId: 2, name: "Tiles Silex Dune 1.42", merchant: "ABC Emporio", price: "25,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop" },
  { id: "8", merchantId: 2, name: "Porcelain Tiles Premium", merchant: "ABC Emporio", price: "60,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop" },
  { id: "9", merchantId: 2, name: "Marble Effect Tiles", merchant: "ABC Emporio", price: "75,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop" },
  { id: "10", merchantId: 2, name: "Wood Look Tiles", merchant: "ABC Emporio", price: "55,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=400&fit=crop" },
  { id: "11", merchantId: 2, name: "Designer Wall Tiles", merchant: "ABC Emporio", price: "65,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&h=400&fit=crop" },
  { id: "12", merchantId: 2, name: "Luxury Floor Tiles", merchant: "ABC Emporio", price: "80,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607686532-37e545c1e101?w=400&h=400&fit=crop" },
  
  // Elite Hardware products (id: 3)
  { id: "13", merchantId: 3, name: "Premium Wall Paint", merchant: "Elite Hardware", price: "45,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop" },
  { id: "14", merchantId: 3, name: "Cement Bags", merchant: "Elite Hardware", price: "18,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=400&fit=crop" },
  { id: "15", merchantId: 3, name: "Steel Rods", merchant: "Elite Hardware", price: "12,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=400&fit=crop" },
  { id: "16", merchantId: 3, name: "Power Tools Set", merchant: "Elite Hardware", price: "250,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=400&h=400&fit=crop" },
  { id: "17", merchantId: 3, name: "Safety Equipment", merchant: "Elite Hardware", price: "85,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=400&fit=crop" },
  { id: "18", merchantId: 3, name: "Building Materials Bundle", merchant: "Elite Hardware", price: "150,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=400&fit=crop" },
  
  // Modern Living Furniture products (id: 4)
  { id: "19", merchantId: 4, name: "Modern Sofa Set", merchant: "Modern Living", price: "1,500,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
  { id: "20", merchantId: 4, name: "Dining Table Set", merchant: "Modern Living", price: "850,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop" },
  { id: "21", merchantId: 4, name: "King Size Bed", merchant: "Modern Living", price: "1,200,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop" },
  { id: "22", merchantId: 4, name: "Office Desk", merchant: "Modern Living", price: "450,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop" },
  { id: "23", merchantId: 4, name: "Wardrobe Cabinet", merchant: "Modern Living", price: "680,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=400&fit=crop" },
  { id: "24", merchantId: 4, name: "Coffee Table", merchant: "Modern Living", price: "180,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop" },
  
  // Bright Lights Tanzania products (id: 5)
  { id: "25", merchantId: 5, name: "LED Ceiling Lights", merchant: "Bright Lights", price: "95,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop" },
  { id: "26", merchantId: 5, name: "Chandelier Crystal", merchant: "Bright Lights", price: "450,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=400&h=400&fit=crop" },
  { id: "27", merchantId: 5, name: "Wall Sconces", merchant: "Bright Lights", price: "65,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
  { id: "28", merchantId: 5, name: "Pendant Lights", merchant: "Bright Lights", price: "85,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop" },
  { id: "29", merchantId: 5, name: "Floor Lamp Modern", merchant: "Bright Lights", price: "120,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
  { id: "30", merchantId: 5, name: "Outdoor Garden Lights", merchant: "Bright Lights", price: "145,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop" },
  
  // Perfect Paint Solutions products (id: 6)
  { id: "31", merchantId: 6, name: "Interior Paint Premium", merchant: "Perfect Paint", price: "55,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop" },
  { id: "32", merchantId: 6, name: "Exterior Paint Weatherproof", merchant: "Perfect Paint", price: "65,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop" },
  { id: "33", merchantId: 6, name: "Paint Brushes Set", merchant: "Perfect Paint", price: "25,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop" },
  { id: "34", merchantId: 6, name: "Primer Undercoat", merchant: "Perfect Paint", price: "35,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop" },
  { id: "35", merchantId: 6, name: "Spray Paint Can", merchant: "Perfect Paint", price: "15,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop" },
  { id: "36", merchantId: 6, name: "Wood Stain", merchant: "Perfect Paint", price: "45,000 Tsh", category: "PAINTING", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop" },
  
  // Premier Plumbing products (id: 7)
  { id: "37", merchantId: 7, name: "PVC Pipes Set", merchant: "Premier Plumbing", price: "35,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1607400201515-c2c41c07dc1c?w=400&h=400&fit=crop" },
  { id: "38", merchantId: 7, name: "Kitchen Sink Stainless", merchant: "Premier Plumbing", price: "95,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop" },
  { id: "39", merchantId: 7, name: "Bathroom Faucets", merchant: "Premier Plumbing", price: "65,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop" },
  { id: "40", merchantId: 7, name: "Water Heater", merchant: "Premier Plumbing", price: "450,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1607400201515-c2c41c07dc1c?w=400&h=400&fit=crop" },
  { id: "41", merchantId: 7, name: "Shower Head Set", merchant: "Premier Plumbing", price: "55,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop" },
  { id: "42", merchantId: 7, name: "Toilet Complete Set", merchant: "Premier Plumbing", price: "280,000 Tsh", category: "PLUMBING", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop" },
  
  // FloorMaster products (id: 8)
  { id: "43", merchantId: 8, name: "Hardwood Flooring", merchant: "FloorMaster", price: "350,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop" },
  { id: "44", merchantId: 8, name: "Laminate Flooring", merchant: "FloorMaster", price: "180,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400&h=400&fit=crop" },
  { id: "45", merchantId: 8, name: "Vinyl Flooring", merchant: "FloorMaster", price: "120,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616137422495-b57a7ff3f47d?w=400&h=400&fit=crop" },
  { id: "46", merchantId: 8, name: "Carpet Tiles", merchant: "FloorMaster", price: "95,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400&h=400&fit=crop" },
  { id: "47", merchantId: 8, name: "Bamboo Flooring", merchant: "FloorMaster", price: "280,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop" },
  { id: "48", merchantId: 8, name: "Cork Flooring", merchant: "FloorMaster", price: "220,000 Tsh", category: "FLOORING", image: "https://images.unsplash.com/photo-1616137422495-b57a7ff3f47d?w=400&h=400&fit=crop" },
  
  // Power Electric products (id: 9)
  { id: "49", merchantId: 9, name: "Circuit Breaker Box", merchant: "Power Electric", price: "125,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop" },
  { id: "50", merchantId: 9, name: "Electrical Wiring Kit", merchant: "Power Electric", price: "85,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop" },
  { id: "51", merchantId: 9, name: "Socket Outlets Set", merchant: "Power Electric", price: "35,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop" },
  { id: "52", merchantId: 9, name: "LED Bulbs Pack", merchant: "Power Electric", price: "45,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop" },
  { id: "53", merchantId: 9, name: "Generator 5KVA", merchant: "Power Electric", price: "1,800,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop" },
  { id: "54", merchantId: 9, name: "Solar Panel Kit", merchant: "Power Electric", price: "2,500,000 Tsh", category: "ELECTRICAL", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop" },
  
  // Green Garden products (id: 10)
  { id: "55", merchantId: 10, name: "Lawn Mower Electric", merchant: "Green Garden", price: "450,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { id: "56", merchantId: 10, name: "Garden Tools Set", merchant: "Green Garden", price: "85,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop" },
  { id: "57", merchantId: 10, name: "Irrigation System", merchant: "Green Garden", price: "320,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop" },
  { id: "58", merchantId: 10, name: "Garden Furniture Set", merchant: "Green Garden", price: "680,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: "59", merchantId: 10, name: "Plant Fertilizer Pack", merchant: "Green Garden", price: "25,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop" },
  { id: "60", merchantId: 10, name: "Garden Decor Set", merchant: "Green Garden", price: "150,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  
  // Quick Fix Repair products (id: 11)
  { id: "61", merchantId: 11, name: "Tool Box Complete", merchant: "Quick Fix", price: "180,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop" },
  { id: "62", merchantId: 11, name: "Electric Drill Set", merchant: "Quick Fix", price: "250,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop" },
  { id: "63", merchantId: 11, name: "Hammer and Nails Kit", merchant: "Quick Fix", price: "35,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop" },
  { id: "64", merchantId: 11, name: "Screwdriver Set", merchant: "Quick Fix", price: "45,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop" },
  { id: "65", merchantId: 11, name: "Measuring Tools", merchant: "Quick Fix", price: "55,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop" },
  { id: "66", merchantId: 11, name: "Safety Gear Kit", merchant: "Quick Fix", price: "75,000 Tsh", category: "REPAIR", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop" },
  
  // Decor Dreams products (id: 12)
  { id: "67", merchantId: 12, name: "Wall Art Canvas", merchant: "Decor Dreams", price: "95,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop" },
  { id: "68", merchantId: 12, name: "Decorative Mirrors", merchant: "Decor Dreams", price: "120,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop" },
  { id: "69", merchantId: 12, name: "Curtains and Drapes", merchant: "Decor Dreams", price: "85,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop" },
  { id: "70", merchantId: 12, name: "Throw Pillows Set", merchant: "Decor Dreams", price: "45,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1604762524889-8df2f5b7ef44?w=400&h=400&fit=crop" },
  { id: "71", merchantId: 12, name: "Vases and Planters", merchant: "Decor Dreams", price: "35,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop" },
  { id: "72", merchantId: 12, name: "Area Rugs", merchant: "Decor Dreams", price: "180,000 Tsh", category: "DECOR", image: "https://images.unsplash.com/photo-1604762524889-8df2f5b7ef44?w=400&h=400&fit=crop" },
  
  // BuildPro Contractors products (id: 13)
  { id: "73", merchantId: 13, name: "Construction Materials", merchant: "BuildPro", price: "500,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "74", merchantId: 13, name: "Scaffolding Rental", merchant: "BuildPro", price: "150,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "75", merchantId: 13, name: "Concrete Mix", merchant: "BuildPro", price: "25,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "76", merchantId: 13, name: "Roofing Sheets", merchant: "BuildPro", price: "85,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "77", merchantId: 13, name: "Foundation Materials", merchant: "BuildPro", price: "350,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "78", merchantId: 13, name: "Building Blocks", merchant: "BuildPro", price: "450 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  
  // ArchDesign Studio products (id: 14)
  { id: "79", merchantId: 14, name: "Architectural Plans", merchant: "ArchDesign", price: "2,500,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "80", merchantId: 14, name: "3D Rendering Service", merchant: "ArchDesign", price: "1,200,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "81", merchantId: 14, name: "Interior Design Package", merchant: "ArchDesign", price: "3,500,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "82", merchantId: 14, name: "Consultation Service", merchant: "ArchDesign", price: "500,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "83", merchantId: 14, name: "Renovation Plans", merchant: "ArchDesign", price: "1,800,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "84", merchantId: 14, name: "Landscape Design", merchant: "ArchDesign", price: "2,200,000 Tsh", category: "ARCHITECTS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  
  // Structural Engineers products (id: 15)
  { id: "85", merchantId: 15, name: "Structural Analysis", merchant: "Structural Engineers", price: "1,500,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "86", merchantId: 15, name: "Foundation Design", merchant: "Structural Engineers", price: "2,000,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "87", merchantId: 15, name: "Building Inspection", merchant: "Structural Engineers", price: "800,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "88", merchantId: 15, name: "Seismic Assessment", merchant: "Structural Engineers", price: "1,200,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "89", merchantId: 15, name: "Load Calculations", merchant: "Structural Engineers", price: "650,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "90", merchantId: 15, name: "Steel Structure Design", merchant: "Structural Engineers", price: "2,800,000 Tsh", category: "ENGINEERS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  
  // Luxury Furnishings products (id: 16)
  { id: "91", merchantId: 16, name: "Executive Office Desk", merchant: "Luxury Furnishings", price: "1,200,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop" },
  { id: "92", merchantId: 16, name: "Leather Recliner", merchant: "Luxury Furnishings", price: "850,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
  { id: "93", merchantId: 16, name: "Luxury Dining Set", merchant: "Luxury Furnishings", price: "2,500,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop" },
  { id: "94", merchantId: 16, name: "Designer Bar Cabinet", merchant: "Luxury Furnishings", price: "680,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=400&fit=crop" },
  { id: "95", merchantId: 16, name: "Entertainment Center", merchant: "Luxury Furnishings", price: "950,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop" },
  { id: "96", merchantId: 16, name: "Master Bedroom Suite", merchant: "Luxury Furnishings", price: "3,200,000 Tsh", category: "FURNITURE", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop" },
  
  // Tile World products (id: 17)
  { id: "97", merchantId: 17, name: "Granite Tiles Premium", merchant: "Tile World", price: "120,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop" },
  { id: "98", merchantId: 17, name: "Mosaic Tiles Set", merchant: "Tile World", price: "95,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop" },
  { id: "99", merchantId: 17, name: "Glass Tiles", merchant: "Tile World", price: "150,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop" },
  { id: "100", merchantId: 17, name: "Stone Effect Tiles", merchant: "Tile World", price: "110,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: "101", merchantId: 17, name: "Anti-Slip Tiles", merchant: "Tile World", price: "85,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop" },
  { id: "102", merchantId: 17, name: "Designer Wall Tiles", merchant: "Tile World", price: "135,000 Tsh", category: "TILES", image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=400&fit=crop" },
  
  // Elegant Lighting products (id: 18)
  { id: "103", merchantId: 18, name: "Crystal Chandelier Large", merchant: "Elegant Lighting", price: "850,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=400&h=400&fit=crop" },
  { id: "104", merchantId: 18, name: "Modern Track Lighting", merchant: "Elegant Lighting", price: "180,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop" },
  { id: "105", merchantId: 18, name: "Designer Pendant Set", merchant: "Elegant Lighting", price: "250,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop" },
  { id: "106", merchantId: 18, name: "Smart LED System", merchant: "Elegant Lighting", price: "450,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
  { id: "107", merchantId: 18, name: "Outdoor Lighting Kit", merchant: "Elegant Lighting", price: "320,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop" },
  { id: "108", merchantId: 18, name: "Luxury Floor Lamps", merchant: "Elegant Lighting", price: "280,000 Tsh", category: "LIGHTING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
  
  // Home Builders products (id: 19)
  { id: "109", merchantId: 19, name: "Construction Package", merchant: "Home Builders", price: "5,000,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "110", merchantId: 19, name: "Renovation Service", merchant: "Home Builders", price: "3,500,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "111", merchantId: 19, name: "Foundation Work", merchant: "Home Builders", price: "2,000,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "112", merchantId: 19, name: "Roofing Service", merchant: "Home Builders", price: "1,500,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  { id: "113", merchantId: 19, name: "Extension Building", merchant: "Home Builders", price: "4,000,000 Tsh", category: "CONTRACTORS", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop" },
  { id: "114", merchantId: 19, name: "Interior Finishing", merchant: "Home Builders", price: "2,500,000 Tsh", category: "BUILDING", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop" },
  
  // Garden Paradise products (id: 20)
  { id: "115", merchantId: 20, name: "Garden Design Service", merchant: "Garden Paradise", price: "1,200,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { id: "116", merchantId: 20, name: "Automatic Sprinkler System", merchant: "Garden Paradise", price: "650,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop" },
  { id: "117", merchantId: 20, name: "Premium Plant Collection", merchant: "Garden Paradise", price: "350,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop" },
  { id: "118", merchantId: 20, name: "Garden Maintenance Kit", merchant: "Garden Paradise", price: "180,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { id: "119", merchantId: 20, name: "Outdoor Furniture Premium", merchant: "Garden Paradise", price: "950,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
  { id: "120", merchantId: 20, name: "Garden Lighting System", merchant: "Garden Paradise", price: "420,000 Tsh", category: "GARDENING", image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop" },
];

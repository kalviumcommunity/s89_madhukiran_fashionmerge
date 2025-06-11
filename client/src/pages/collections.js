export const collections = [
  {
    id: 1,
    category: "All",
    items: [
      {
        id: 1001,
        name: "Heritage Oxford Shirt",
        description: "Timeless white oxford shirt crafted from premium Egyptian cotton. Features mother-of-pearl buttons and a perfect collar that stays crisp all day.",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop",
        price: 89.00,
        gender: "men",
        subcategory: "shirts",
        details: {
          material: "100% Egyptian Cotton",
          care: "Machine wash cold, iron while damp",
          size: ["S", "M", "L", "XL"],
          color: ["#FFFFFF", "#E6F3FF", "#F0F8FF"]
        },
        stock: 18
      },
      {
        id: 1002,
        name: "Midnight Silk Dress",
        description: "Elegant black silk dress with a flowing silhouette and subtle sheen. Perfect for evening events or sophisticated dinners.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop",
        price: 245.00,
        gender: "women",
        subcategory: "dresses",
        details: {
          material: "100% Mulberry Silk",
          care: "Dry clean only",
          size: ["XS", "S", "M", "L"],
          color: ["#000000", "#1a1a1a", "#2c2c2c"]
        },
        stock: 12
      },
      {
        id: 1003,
        name: "Minimalist Steel Watch",
        description: "Clean, modern timepiece with Swiss movement and sapphire crystal. Features a sleek steel case and leather strap.",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=600&fit=crop",
        price: 395.00,
        gender: "unisex",
        subcategory: "watches",
        details: {
          material: "Stainless Steel, Sapphire Crystal",
          care: "Water resistant to 50m",
          size: ["42mm"],
          color: ["#C0C0C0", "#000000"]
        },
        stock: 8
      },
      {
        id: 1004,
        name: "Italian Leather Tote",
        description: "Handcrafted leather tote bag made in Florence. Features premium hardware and spacious interior with organizational pockets.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
        price: 285.00,
        gender: "women",
        subcategory: "bags",
        details: {
          material: "Full-Grain Italian Leather",
          care: "Condition monthly, store with dust bag",
          size: ["One Size"],
          color: ["#8B4513", "#000000", "#654321"]
        },
        stock: 15
      },
      {
        id: 1005,
        name: "Merino Wool Sweater",
        description: "Luxurious crew neck sweater in extra-fine merino wool. Lightweight yet warm, perfect for layering or wearing alone.",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop",
        price: 165.00,
        gender: "men",
        subcategory: "sweaters",
        details: {
          material: "100% Extra Fine Merino Wool",
          care: "Hand wash cold, lay flat to dry",
          size: ["S", "M", "L", "XL"],
          color: ["#2F4F4F", "#000000", "#8B4513"]
        },
        stock: 22
      },
      {
        id: 1006,
        name: "Ceramic Art Vase",
        description: "Handcrafted ceramic vase with organic curves and matte finish. Each piece is unique, perfect for modern home decor.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop",
        price: 125.00,
        gender: "unisex",
        subcategory: "decor",
        details: {
          material: "High-Fire Ceramic",
          care: "Hand wash only",
          size: ["Medium (12\")"],
          color: ["#F5F5DC", "#D2B48C", "#8B7355"]
        },
        stock: 10
      },
      // Products from "Accessories" category
      {
        id: 2001,
        name: "Classic Aviator Sunglasses",
        description: "Iconic aviator sunglasses with polarized lenses and gold-tone frame. Offers 100% UV protection with timeless style.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "unisex",
        subcategory: "sunglasses",
        details: {
          material: "Metal Frame, Polarized Glass Lenses",
          care: "Clean with microfiber cloth, store in case",
          size: ["One Size"],
          color: ["#FFD700", "#C0C0C0", "#000000"]
        },
        stock: 25
      },
      {
        id: 2002,
        name: "Vintage Leather Belt",
        description: "Handcrafted leather belt with antique brass buckle. Made from full-grain leather that develops beautiful patina over time.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR-iBD0Beah4yG7m_JfRUzC1GR9XlzM1qXBGJjSdKIaplGi8xqYzoVh82l_OQUplsDUBdkh4_7kxwL1LiqG8cGo_7kIUId2_jdsCujf9s4",
        price: 85.00,
        gender: "men",
        subcategory: "belts",
        details: {
          material: "Full-Grain Leather, Brass Buckle",
          care: "Condition regularly, avoid water",
          size: ["32", "34", "36", "38", "40"],
          color: ["#8B4513", "#654321", "#000000"]
        },
        stock: 20
      },
      {
        id: 2003,
        name: "Sterling Silver Necklace",
        description: "Delicate sterling silver chain with minimalist pendant. Perfect for everyday wear or special occasions.",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop",
        price: 125.00,
        gender: "women",
        subcategory: "jewelry",
        details: {
          material: "925 Sterling Silver",
          care: "Store in anti-tarnish pouch, clean with silver cloth",
          size: ["16\"", "18\"", "20\""],
          color: ["#C0C0C0"]
        },
        stock: 18
      },
      {
        id: 2004,
        name: "Canvas Messenger Bag",
        description: "Durable canvas messenger bag with leather trim. Features laptop compartment and adjustable strap for comfort.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
        price: 165.00,
        gender: "unisex",
        subcategory: "bags",
        details: {
          material: "Waxed Canvas, Leather Trim",
          care: "Spot clean, condition leather parts",
          size: ["One Size"],
          color: ["#556B2F", "#8B4513", "#2F4F4F"]
        },
        stock: 12
      },
      {
        id: 2005,
        name: "Wool Fedora Hat",
        description: "Classic fedora hat in premium wool felt. Features grosgrain ribbon band and timeless silhouette.",
        image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop",
        price: 95.00,
        gender: "unisex",
        subcategory: "hats",
        details: {
          material: "100% Wool Felt",
          care: "Brush gently, store on hat stand",
          size: ["S", "M", "L"],
          color: ["#2F4F4F", "#8B4513", "#000000"]
        },
        stock: 14
      },
      // Products from "Men's Clothing" category
      {
        id: 3001,
        name: "Premium Cotton T-Shirt",
        description: "Essential crew neck t-shirt in premium organic cotton. Features reinforced seams and a perfect fit that maintains its shape.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
        price: 45.00,
        gender: "men",
        subcategory: "t-shirts",
        details: {
          material: "100% Organic Cotton",
          care: "Machine wash cold, tumble dry low",
          size: ["S", "M", "L", "XL", "XXL"],
          color: ["#FFFFFF", "#000000", "#2F4F4F", "#8B4513"]
        },
        stock: 35
      },
      {
        id: 3002,
        name: "Tailored Chino Pants",
        description: "Modern fit chinos with stretch comfort. Perfect for both office and weekend wear with a clean, tailored appearance.",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop",
        price: 125.00,
        gender: "men",
        subcategory: "pants",
        details: {
          material: "97% Cotton, 3% Elastane",
          care: "Machine wash cold, hang dry",
          size: ["30", "32", "34", "36", "38", "40"],
          color: ["#2F4F4F", "#8B4513", "#556B2F", "#000080"]
        },
        stock: 28
      },
      {
        id: 3003,
        name: "Wool Blazer",
        description: "Sophisticated single-breasted blazer in premium wool blend. Features notched lapels and modern tailoring.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT56cWHvu0efHgFi6-pnIOUZVdpcN7nl3VLBCBvPK53NmlYsfFh0PY0zvkL--l1ySioZKU4tmTvMdCr2G7LQqMJhlkKUfnnq_lcPaF78-9fX1lXiPRqm3ZQhA",
        price: 295.00,
        gender: "men",
        subcategory: "jackets",
        details: {
          material: "85% Wool, 15% Cashmere",
          care: "Dry clean only",
          size: ["36", "38", "40", "42", "44"],
          color: ["#2C3E50", "#8B4513", "#36454F"]
        },
        stock: 15
      },
      {
        id: 3004,
        name: "Classic Navy Suit",
        description: "Timeless two-piece suit in premium wool. Features half-canvas construction and modern fit for versatile styling.",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
        price: 595.00,
        gender: "men",
        subcategory: "suits",
        details: {
          material: "100% Virgin Wool",
          care: "Dry clean only, professional pressing",
          size: ["36R", "38R", "40R", "42R", "44R"],
          color: ["#000080", "#2C3E50", "#000000"]
        },
        stock: 8
      },
      {
        id: 3005,
        name: "Cashmere Crew Sweater",
        description: "Luxurious crew neck sweater in pure cashmere. Lightweight yet warm with a timeless design.",
        image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSvvH4a729KQXFtYF_6F1QSp9iDCN8bIQw8mgWbcHwAuW19OHeT8E6KNVjRL3-xmbfZlQFBaTkp0a5aZik-g72vEQmINYDtPCjz9iZD9Ze3TW76fTRhVHbUzwwZIiI2DaLmAi3kMI577pk&usqp=CAc",
        price: 185.00,
        gender: "men",
        subcategory: "sweaters",
        details: {
          material: "100% Cashmere",
          care: "Hand wash cold, lay flat to dry",
          size: ["S", "M", "L", "XL"],
          color: ["#2F4F4F", "#8B4513", "#000000", "#FFFFFF"]
        },
        stock: 20
      },
      // Products from "Women's Clothing" category
      {
        id: 4001,
        name: "Flowing Maxi Dress",
        description: "Elegant maxi dress in lightweight chiffon with delicate floral print. Perfect for summer events and special occasions.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop",
        price: 185.00,
        gender: "women",
        subcategory: "dresses",
        details: {
          material: "100% Silk Chiffon",
          care: "Dry clean only",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#FFB6C1", "#E6E6FA", "#F0F8FF"]
        },
        stock: 16
      },
      {
        id: 4002,
        name: "Cashmere V-Neck Top",
        description: "Luxurious v-neck top in soft cashmere blend. Features a relaxed fit perfect for layering or wearing alone.",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "women",
        subcategory: "tops",
        details: {
          material: "70% Cashmere, 30% Silk",
          care: "Hand wash cold, lay flat to dry",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#F5F5DC", "#FFB6C1", "#E6E6FA"]
        },
        stock: 22
      },
      {
        id: 4003,
        name: "Pleated Midi Skirt",
        description: "Sophisticated pleated skirt in premium crepe fabric. Features an elastic waistband and flowing silhouette.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ7b4CUGrjE96Zo5lOrKs4QsssN2H0x4k8ll9KfA14pOCCnUi4L2vHArdQ6Q4yrmoTA1xvQanpFg3GIe-ixUg-V7Qkt-yvIHHILHT_WkKY",
        price: 115.00,
        gender: "women",
        subcategory: "skirts",
        details: {
          material: "100% Polyester Crepe",
          care: "Machine wash cold, hang dry",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#2F4F4F", "#8B0000"]
        },
        stock: 25
      },
      {
        id: 4004,
        name: "High-Waisted Trousers",
        description: "Elegant high-waisted trousers with pressed creases. Features a sophisticated silhouette with stretch comfort.",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop",
        price: 155.00,
        gender: "women",
        subcategory: "pants",
        details: {
          material: "68% Wool, 30% Polyester, 2% Elastane",
          care: "Dry clean recommended",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#2F4F4F", "#8B4513"]
        },
        stock: 18
      },
      {
        id: 4005,
        name: "Silk Button Blouse",
        description: "Classic silk blouse with mother-of-pearl buttons. Features French seams and a tailored fit.",
        image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRk7XHDMlh2d7qOyOW8BNjF2TEgEaM2p-HyyB3WLLM6rVvhja_GOMLBiWYkHnHLBlWur5eyXsCuJJCDO98XvLxdDyFL8bIG0M8nD2GT5GZD2CxN-6giXXk12Q",
        price: 125.00,
        gender: "women",
        subcategory: "blouses",
        details: {
          material: "100% Mulberry Silk",
          care: "Dry clean only",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#FFFFFF", "#FFB6C1", "#E6E6FA"]
        },
        stock: 20
      },
      // Products from "Maison" category
      {
        id: 5001,
        name: "Scandinavian Dining Chair",
        description: "Modern dining chair with solid oak frame and upholstered seat. Features clean lines and timeless Scandinavian design.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=600&fit=crop",
        price: 285.00,
        gender: "unisex",
        subcategory: "furniture",
        details: {
          material: "Solid Oak Wood, Wool Upholstery",
          care: "Dust regularly, professional cleaning for upholstery",
          size: ["Standard"],
          color: ["#D2B48C", "#8B4513", "#F5F5DC"]
        },
        stock: 12
      },
      {
        id: 5002,
        name: "Linen Sheet Set",
        description: "Premium linen sheets with stone-washed finish. Naturally breathable and gets softer with every wash.",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=600&fit=crop",
        price: 195.00,
        gender: "unisex",
        subcategory: "bedding",
        details: {
          material: "100% European Flax Linen",
          care: "Machine wash cold, tumble dry low",
          size: ["Twin", "Full", "Queen", "King"],
          color: ["#FFFFFF", "#F5F5DC", "#E6E6FA"]
        },
        stock: 18
      },
      {
        id: 5003,
        name: "Cast Iron Dutch Oven",
        description: "Enameled cast iron Dutch oven perfect for braising and baking. Excellent heat retention and even cooking.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlbeUB1gDK46meICBOLE6rUtRjrtKRuQF-Xg&s",
        price: 245.00,
        gender: "unisex",
        subcategory: "kitchenware",
        details: {
          material: "Cast Iron with Enamel Coating",
          care: "Hand wash, dry immediately",
          size: ["5.5 Qt", "7.25 Qt"],
          color: ["#8B0000", "#2F4F4F", "#F5F5DC"]
        },
        stock: 14
      },
      {
        id: 5004,
        name: "Minimalist Table Lamp",
        description: "Modern table lamp with brass base and linen shade. Provides warm, ambient lighting for any space.",
        image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSoY0i7vg9F_Vs0wKBamjTtfS7gxaloYogXBPDLenbpYyZ3M9am5QcOnw1ag3e-afq-_Hh2kV0cFiRbpKzhl_v-hsvQtAoExtvpE4kP9sY&usqp=CAc",
        price: 165.00,
        gender: "unisex",
        subcategory: "decor",
        details: {
          material: "Brass Base, Linen Shade",
          care: "Dust with soft cloth",
          size: ["Medium (18\" H)"],
          color: ["#B8860B", "#F5F5DC"]
        },
        stock: 20
      },
      {
        id: 5005,
        name: "Handwoven Throw Blanket",
        description: "Cozy throw blanket in soft alpaca wool. Handwoven with traditional techniques for exceptional quality.",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "unisex",
        subcategory: "bedding",
        details: {
          material: "100% Alpaca Wool",
          care: "Dry clean only",
          size: ["50\" x 60\""],
          color: ["#F5F5DC", "#D2B48C", "#8B4513"]
        },
        stock: 16
      }
    ]
  },
  {
    id: 2,
    category: "Accessories",
    items: [
      {
        id: 2001,
        name: "Classic Aviator Sunglasses",
        description: "Iconic aviator sunglasses with polarized lenses and gold-tone frame. Offers 100% UV protection with timeless style.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "unisex",
        subcategory: "sunglasses",
        details: {
          material: "Metal Frame, Polarized Glass Lenses",
          care: "Clean with microfiber cloth, store in case",
          size: ["One Size"],
          color: ["#FFD700", "#C0C0C0", "#000000"]
        },
        stock: 25
      },
      {
        id: 2002,
        name: "Vintage Leather Belt",
        description: "Handcrafted leather belt with antique brass buckle. Made from full-grain leather that develops beautiful patina over time.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR-iBD0Beah4yG7m_JfRUzC1GR9XlzM1qXBGJjSdKIaplGi8xqYzoVh82l_OQUplsDUBdkh4_7kxwL1LiqG8cGo_7kIUId2_jdsCujf9s4",
        price: 85.00,
        gender: "men",
        subcategory: "belts",
        details: {
          material: "Full-Grain Leather, Brass Buckle",
          care: "Condition regularly, avoid water",
          size: ["32", "34", "36", "38", "40"],
          color: ["#8B4513", "#654321", "#000000"]
        },
        stock: 20
      },
      {
        id: 2003,
        name: "Sterling Silver Necklace",
        description: "Delicate sterling silver chain with minimalist pendant. Perfect for everyday wear or special occasions.",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop",
        price: 125.00,
        gender: "women",
        subcategory: "jewelry",
        details: {
          material: "925 Sterling Silver",
          care: "Store in anti-tarnish pouch, clean with silver cloth",
          size: ["16\"", "18\"", "20\""],
          color: ["#C0C0C0"]
        },
        stock: 18
      },
      {
        id: 2004,
        name: "Canvas Messenger Bag",
        description: "Durable canvas messenger bag with leather trim. Features laptop compartment and adjustable strap for comfort.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
        price: 165.00,
        gender: "unisex",
        subcategory: "bags",
        details: {
          material: "Waxed Canvas, Leather Trim",
          care: "Spot clean, condition leather parts",
          size: ["One Size"],
          color: ["#556B2F", "#8B4513", "#2F4F4F"]
        },
        stock: 12
      },
      {
        id: 2005,
        name: "Wool Fedora Hat",
        description: "Classic fedora hat in premium wool felt. Features grosgrain ribbon band and timeless silhouette.",
        image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop",
        price: 95.00,
        gender: "unisex",
        subcategory: "hats",
        details: {
          material: "100% Wool Felt",
          care: "Brush gently, store on hat stand",
          size: ["S", "M", "L"],
          color: ["#2F4F4F", "#8B4513", "#000000"]
        },
        stock: 14
      }
    ]
  },
  {
    id: 3,
    category: "Men's Clothing",
    items: [
      {
        id: 3001,
        name: "Premium Cotton T-Shirt",
        description: "Essential crew neck t-shirt in premium organic cotton. Features reinforced seams and a perfect fit that maintains its shape.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
        price: 45.00,
        gender: "men",
        subcategory: "t-shirts",
        details: {
          material: "100% Organic Cotton",
          care: "Machine wash cold, tumble dry low",
          size: ["S", "M", "L", "XL", "XXL"],
          color: ["#FFFFFF", "#000000", "#2F4F4F", "#8B4513"]
        },
        stock: 35
      },
      {
        id: 3002,
        name: "Tailored Chino Pants",
        description: "Modern fit chinos with stretch comfort. Perfect for both office and weekend wear with a clean, tailored appearance.",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop",
        price: 125.00,
        gender: "men",
        subcategory: "pants",
        details: {
          material: "97% Cotton, 3% Elastane",
          care: "Machine wash cold, hang dry",
          size: ["30", "32", "34", "36", "38", "40"],
          color: ["#2F4F4F", "#8B4513", "#556B2F", "#000080"]
        },
        stock: 28
      },
      {
        id: 3003,
        name: "Wool Blazer",
        description: "Sophisticated single-breasted blazer in premium wool blend. Features notched lapels and modern tailoring.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT56cWHvu0efHgFi6-pnIOUZVdpcN7nl3VLBCBvPK53NmlYsfFh0PY0zvkL--l1ySioZKU4tmTvMdCr2G7LQqMJhlkKUfnnq_lcPaF78-9fX1lXiPRqm3ZQhA",
        price: 295.00,
        gender: "men",
        subcategory: "jackets",
        details: {
          material: "85% Wool, 15% Cashmere",
          care: "Dry clean only",
          size: ["36", "38", "40", "42", "44"],
          color: ["#2C3E50", "#8B4513", "#36454F"]
        },
        stock: 15
      },
      {
        id: 3004,
        name: "Classic Navy Suit",
        description: "Timeless two-piece suit in premium wool. Features half-canvas construction and modern fit for versatile styling.",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
        price: 595.00,
        gender: "men",
        subcategory: "suits",
        details: {
          material: "100% Virgin Wool",
          care: "Dry clean only, professional pressing",
          size: ["36R", "38R", "40R", "42R", "44R"],
          color: ["#000080", "#2C3E50", "#000000"]
        },
        stock: 8
      },
      {
        id: 3005,
        name: "Cashmere Crew Sweater",
        description: "Luxurious crew neck sweater in pure cashmere. Lightweight yet warm with a timeless design.",
        image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSvvH4a729KQXFtYF_6F1QSp9iDCN8bIQw8mgWbcHwAuW19OHeT8E6KNVjRL3-xmbfZlQFBaTkp0a5aZik-g72vEQmINYDtPCjz9iZD9Ze3TW76fTRhVHbUzwwZIiI2DaLmAi3kMI577pk&usqp=CAc",
        price: 185.00,
        gender: "men",
        subcategory: "sweaters",
        details: {
          material: "100% Cashmere",
          care: "Hand wash cold, lay flat to dry",
          size: ["S", "M", "L", "XL"],
          color: ["#2F4F4F", "#8B4513", "#000000", "#FFFFFF"]
        },
        stock: 20
      }
    ]
  },
  {
    id: 4,
    category: "Women's Clothing",
    items: [
      {
        id: 4001,
        name: "Flowing Maxi Dress",
        description: "Elegant maxi dress in lightweight chiffon with delicate floral print. Perfect for summer events and special occasions.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop",
        price: 185.00,
        gender: "women",
        subcategory: "dresses",
        details: {
          material: "100% Silk Chiffon",
          care: "Dry clean only",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#FFB6C1", "#E6E6FA", "#F0F8FF"]
        },
        stock: 16
      },
      {
        id: 4002,
        name: "Cashmere V-Neck Top",
        description: "Luxurious v-neck top in soft cashmere blend. Features a relaxed fit perfect for layering or wearing alone.",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "women",
        subcategory: "tops",
        details: {
          material: "70% Cashmere, 30% Silk",
          care: "Hand wash cold, lay flat to dry",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#F5F5DC", "#FFB6C1", "#E6E6FA"]
        },
        stock: 22
      },
      {
        id: 4003,
        name: "Pleated Midi Skirt",
        description: "Sophisticated pleated skirt in premium crepe fabric. Features an elastic waistband and flowing silhouette.",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ7b4CUGrjE96Zo5lOrKs4QsssN2H0x4k8ll9KfA14pOCCnUi4L2vHArdQ6Q4yrmoTA1xvQanpFg3GIe-ixUg-V7Qkt-yvIHHILHT_WkKY",
        price: 115.00,
        gender: "women",
        subcategory: "skirts",
        details: {
          material: "100% Polyester Crepe",
          care: "Machine wash cold, hang dry",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#2F4F4F", "#8B0000"]
        },
        stock: 25
      },
      {
        id: 4004,
        name: "High-Waisted Trousers",
        description: "Elegant high-waisted trousers with pressed creases. Features a sophisticated silhouette with stretch comfort.",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop",
        price: 155.00,
        gender: "women",
        subcategory: "pants",
        details: {
          material: "68% Wool, 30% Polyester, 2% Elastane",
          care: "Dry clean recommended",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#2F4F4F", "#8B4513"]
        },
        stock: 18
      },
      {
        id: 4005,
        name: "Silk Button Blouse",
        description: "Classic silk blouse with mother-of-pearl buttons. Features French seams and a tailored fit.",
        image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRk7XHDMlh2d7qOyOW8BNjF2TEgEaM2p-HyyB3WLLM6rVvhja_GOMLBiWYkHnHLBlWur5eyXsCuJJCDO98XvLxdDyFL8bIG0M8nD2GT5GZD2CxN-6giXXk12Q",
        price: 125.00,
        gender: "women",
        subcategory: "blouses",
        details: {
          material: "100% Mulberry Silk",
          care: "Dry clean only",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#FFFFFF", "#FFB6C1", "#E6E6FA"]
        },
        stock: 20
      }
    ]
  },
  {
    id: 5,
    category: "Maison",
    items: [
      {
        id: 5001,
        name: "Scandinavian Dining Chair",
        description: "Modern dining chair with solid oak frame and upholstered seat. Features clean lines and timeless Scandinavian design.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=600&fit=crop",
        price: 285.00,
        gender: "unisex",
        subcategory: "furniture",
        details: {
          material: "Solid Oak Wood, Wool Upholstery",
          care: "Dust regularly, professional cleaning for upholstery",
          size: ["Standard"],
          color: ["#D2B48C", "#8B4513", "#F5F5DC"]
        },
        stock: 12
      },
      {
        id: 5002,
        name: "Linen Sheet Set",
        description: "Premium linen sheets with stone-washed finish. Naturally breathable and gets softer with every wash.",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=600&fit=crop",
        price: 195.00,
        gender: "unisex",
        subcategory: "bedding",
        details: {
          material: "100% European Flax Linen",
          care: "Machine wash cold, tumble dry low",
          size: ["Twin", "Full", "Queen", "King"],
          color: ["#FFFFFF", "#F5F5DC", "#E6E6FA"]
        },
        stock: 18
      },
      {
        id: 5003,
        name: "Cast Iron Dutch Oven",
        description: "Enameled cast iron Dutch oven perfect for braising and baking. Excellent heat retention and even cooking.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlbeUB1gDK46meICBOLE6rUtRjrtKRuQF-Xg&s",
        price: 245.00,
        gender: "unisex",
        subcategory: "kitchenware",
        details: {
          material: "Cast Iron with Enamel Coating",
          care: "Hand wash, dry immediately",
          size: ["5.5 Qt", "7.25 Qt"],
          color: ["#8B0000", "#2F4F4F", "#F5F5DC"]
        },
        stock: 14
      },
      {
        id: 5004,
        name: "Minimalist Table Lamp",
        description: "Modern table lamp with brass base and linen shade. Provides warm, ambient lighting for any space.",
        image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSoY0i7vg9F_Vs0wKBamjTtfS7gxaloYogXBPDLenbpYyZ3M9am5QcOnw1ag3e-afq-_Hh2kV0cFiRbpKzhl_v-hsvQtAoExtvpE4kP9sY&usqp=CAc",
        price: 165.00,
        gender: "unisex",
        subcategory: "decor",
        details: {
          material: "Brass Base, Linen Shade",
          care: "Dust with soft cloth",
          size: ["Medium (18\" H)"],
          color: ["#B8860B", "#F5F5DC"]
        },
        stock: 20
      },
      {
        id: 5005,
        name: "Handwoven Throw Blanket",
        description: "Cozy throw blanket in soft alpaca wool. Handwoven with traditional techniques for exceptional quality.",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=600&fit=crop",
        price: 145.00,
        gender: "unisex",
        subcategory: "bedding",
        details: {
          material: "100% Alpaca Wool",
          care: "Dry clean only",
          size: ["50\" x 60\""],
          color: ["#F5F5DC", "#D2B48C", "#8B4513"]
        },
        stock: 16
      }
    ]
  }
];
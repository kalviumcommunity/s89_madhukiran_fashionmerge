// Dummy data for fashion collections
export const collections = [
    {
      id: 1,
      category: "All",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: 1000 + i,
        name: `Signature Collection Item ${i + 1}`,
        image: `https://images.pexels.com/photos/${5709661 + i}/pexels-photo-${5709661 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
        price: 199.99 + (i * 10),
        details: {
          material: "Premium Italian fabric blend (80% Cotton, 20% Silk)",
          care: "Dry clean only. Iron on low heat if needed.",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#FFFFFF", "#C6A07C", "#5E7A7C"]
        },
        stock: Math.floor(Math.random() * 20) + 5
      }))
    },
    {
      id: 2,
      category: "Accessories",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: 2000 + i,
        name: `Luxury Accessory ${i + 1}`,
        image: `https://images.pexels.com/photos/${1152077 + i}/pexels-photo-${1152077 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
        price: 89.99 + (i * 5),
        details: {
          material: "Premium leather and brass hardware",
          care: "Store in dust bag. Clean with leather conditioner.",
          size: ["One Size"],
          color: ["#8B4513", "#000000", "#C6A07C"]
        },
        stock: Math.floor(Math.random() * 15) + 3
      }))
    },
    {
      id: 3,
      category: "Men's Clothing",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: 3000 + i,
        name: `Men's Essential ${i + 1}`,
        image: `https://images.pexels.com/photos/${1300550 + i}/pexels-photo-${1300550 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
        price: 149.99 + (i * 8),
        details: {
          material: "100% Egyptian Cotton",
          care: "Machine wash cold. Tumble dry low.",
          size: ["S", "M", "L", "XL", "XXL"],
          color: ["#000000", "#NAVY", "#GRAY", "#WHITE"]
        },
        stock: Math.floor(Math.random() * 25) + 8
      }))
    },
    {
      id: 4,
      category: "Women's Clothing",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: 4000 + i,
        name: `Women's Collection ${i + 1}`,
        image: `https://images.pexels.com/photos/${1036623 + i}/pexels-photo-${1036623 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
        price: 179.99 + (i * 7),
        details: {
          material: "Premium blend of natural fibers",
          care: "Gentle wash cycle. Hang to dry.",
          size: ["XS", "S", "M", "L", "XL"],
          color: ["#000000", "#FFF5EE", "#B76E79", "#545454"]
        },
        stock: Math.floor(Math.random() * 20) + 5
      }))
    },
    {
      id: 5,
      category: "Maison",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: 5000 + i,
        name: `Home Collection ${i + 1}`,
        description: "Transform your living space with our curated home collection.",
        image: `https://images.pexels.com/photos/${1571459 + i}/pexels-photo-${1571459 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
        price: 129.99 + (i * 6),
        details: {
          material: "Premium sustainable materials",
          care: "Spot clean only. Professional cleaning recommended.",
          size: ["Small", "Medium", "Large"],
          color: ["#D4B996", "#545454", "#000000", "#FFFFFF"]
        },
        stock: Math.floor(Math.random() * 15) + 3
      }))
    }
  ];
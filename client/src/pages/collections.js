// Dummy data for fashion collections with enhanced gender and category information
export const collections = [
    {
      id: 1,
      category: "All",
      items: Array.from({ length: 100 }, (_, i) => {
        // Determine gender and subcategory based on index
        let gender = i % 3 === 0 ? "men" : i % 3 === 1 ? "women" : "unisex";
        let subcategory;

        if (gender === "men") {
          subcategory = i % 4 === 0 ? "t-shirts" : i % 4 === 1 ? "pants" : i % 4 === 2 ? "jackets" : "shoes";
        } else if (gender === "women") {
          subcategory = i % 4 === 0 ? "dresses" : i % 4 === 1 ? "tops" : i % 4 === 2 ? "skirts" : "shoes";
        } else {
          subcategory = i % 3 === 0 ? "accessories" : i % 3 === 1 ? "bags" : "jewelry";
        }

        return {
          id: 1000 + i,
          name: `${gender === "men" ? "Men's" : gender === "women" ? "Women's" : "Unisex"} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${i + 1}`,
          image: `https://images.pexels.com/photos/${5709661 + i}/pexels-photo-${5709661 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          price: 199.99 + (i * 10),
          gender: gender,
          subcategory: subcategory,
          details: {
            material: "Premium Italian fabric blend (80% Cotton, 20% Silk)",
            care: "Dry clean only. Iron on low heat if needed.",
            size: ["XS", "S", "M", "L", "XL"],
            color: ["#000000", "#FFFFFF", "#C6A07C", "#5E7A7C"]
          },
          stock: Math.floor(Math.random() * 20) + 5
        };
      })
    },
    {
      id: 2,
      category: "Accessories",
      items: Array.from({ length: 100 }, (_, i) => {
        // Determine gender and accessory type
        let gender = i % 3 === 0 ? "men" : i % 3 === 1 ? "women" : "unisex";
        let subcategory;

        // Ensure a good mix of accessory types for better search results
        if (i % 6 === 0) subcategory = "watches";
        else if (i % 6 === 1) subcategory = "belts";
        else if (i % 6 === 2) subcategory = "hats";
        else if (i % 6 === 3) subcategory = "sunglasses";
        else if (i % 6 === 4) subcategory = "jewelry";
        else subcategory = "bags";

        return {
          id: 2000 + i,
          name: `${gender === "men" ? "Men's" : gender === "women" ? "Women's" : "Unisex"} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${i + 1}`,
          image: `https://images.pexels.com/photos/${1152077 + i}/pexels-photo-${1152077 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          price: 89.99 + (i * 5),
          gender: gender,
          subcategory: subcategory,
          details: {
            material: "Premium leather and brass hardware",
            care: "Store in dust bag. Clean with leather conditioner.",
            size: ["One Size"],
            color: ["#8B4513", "#000000", "#C6A07C"]
          },
          stock: Math.floor(Math.random() * 15) + 3
        };
      })
    },
    {
      id: 3,
      category: "Men's Clothing",
      items: Array.from({ length: 100 }, (_, i) => {
        // Men's clothing subcategories
        let subcategory = i % 5 === 0 ? "t-shirts" : i % 5 === 1 ? "pants" : i % 5 === 2 ? "jackets" : i % 5 === 3 ? "suits" : "sweaters";

        return {
          id: 3000 + i,
          name: `Men's ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${i + 1}`,
          image: `https://images.pexels.com/photos/${1300550 + i}/pexels-photo-${1300550 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          price: 149.99 + (i * 8),
          gender: "men",
          subcategory: subcategory,
          details: {
            material: "100% Egyptian Cotton",
            care: "Machine wash cold. Tumble dry low.",
            size: ["S", "M", "L", "XL", "XXL"],
            color: ["#000000", "#NAVY", "#GRAY", "#WHITE"]
          },
          stock: Math.floor(Math.random() * 25) + 8
        };
      })
    },
    {
      id: 4,
      category: "Women's Clothing",
      items: Array.from({ length: 100 }, (_, i) => {
        // Women's clothing subcategories
        let subcategory = i % 5 === 0 ? "dresses" : i % 5 === 1 ? "tops" : i % 5 === 2 ? "skirts" : i % 5 === 3 ? "pants" : "blouses";

        return {
          id: 4000 + i,
          name: `Women's ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${i + 1}`,
          image: `https://images.pexels.com/photos/${1036623 + i}/pexels-photo-${1036623 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          price: 179.99 + (i * 7),
          gender: "women",
          subcategory: subcategory,
          details: {
            material: "Premium blend of natural fibers",
            care: "Gentle wash cycle. Hang to dry.",
            size: ["XS", "S", "M", "L", "XL"],
            color: ["#000000", "#FFF5EE", "#B76E79", "#545454"]
          },
          stock: Math.floor(Math.random() * 20) + 5
        };
      })
    },
    {
      id: 5,
      category: "Maison",
      items: Array.from({ length: 100 }, (_, i) => {
        // Home subcategories
        let subcategory = i % 4 === 0 ? "decor" : i % 4 === 1 ? "bedding" : i % 4 === 2 ? "kitchenware" : "furniture";

        return {
          id: 5000 + i,
          name: `Home ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${i + 1}`,
          image: `https://images.pexels.com/photos/${1571459 + i}/pexels-photo-${1571459 + i}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          price: 129.99 + (i * 6),
          gender: "unisex",
          subcategory: subcategory,
          details: {
            material: "Premium sustainable materials",
            care: "Spot clean only. Professional cleaning recommended.",
            size: ["Small", "Medium", "Large"],
            color: ["#D4B996", "#545454", "#000000", "#FFFFFF"]
          },
          stock: Math.floor(Math.random() * 15) + 3
        };
      })
    }
  ];
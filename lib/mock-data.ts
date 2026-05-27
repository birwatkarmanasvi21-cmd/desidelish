import { Restaurant, Deal } from './types';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Big Bowl',
    image: '/food-images/butter-chicken.jpg',
    rating: 4.8,
    distance: 0.5,
    deliveryTime: '15-20 mins',
    cuisine: ['Indo-Chinese', 'Indian'],
    priceRange: 2,
    isOpen: true,
    minOrder: 15,
    menu: [
      {
        id: 'm1',
        name: 'Butter Chicken',
        description: 'Tender, marinated tandoori chicken simmered in a rich, velvety, and mildly spiced tomato gravy',
        price: 320,
        image: '/food-images/butter-chicken.jpg',
        rating: 4.5,
        category: 'Gravy'
      },
      {
        id: 'm2',
        name: 'Tandoori Chicken',
        description: 'Marinated in yogurt and spices, grilled to perfection',
        price: 280,
        image: '/food-images/tandoori-chicken.jpg',
        rating: 4.7,
        category: 'Main Course'
      },
      {
        id: 'm3',
        name: 'Paneer Chilli',
        description: 'Crispy paneer cubes tossed in a spicy, tangy Indo-Chinese sauce',
        price: 240,
        image: '/food-images/paneer-chilli.jpg',
        rating: 4.4,
        category: 'Appetizers'
      },
      {
        id: 'm4',
        name: 'Garlic Naan',
        description: 'Soft Indian flatbread baked in tandoor with garlic and butter',
        price: 80,
        image: '/food-images/garlic-naan.jpg',
        rating: 4.6,
        category: 'Bread'
      },
    ]
  },
  {
    id: '2',
    name: 'Spice Haven',
    image: '/food-images/dal-khichdi.jpg',
    rating: 4.6,
    distance: 1.2,
    deliveryTime: '25-30 mins',
    cuisine: ['Indian', 'Asian'],
    priceRange: 2,
    isOpen: true,
    minOrder: 20,
    menu: [
      {
        id: 'm5',
        name: 'Dal Khichdi',
        description: 'Nutritious one-pot meal with rice, lentils, mild spices, turmeric and ghee',
        price: 180,
        image: '/food-images/dal-khichdi.jpg',
        rating: 4.8,
        category: 'Mains'
      },
      {
        id: 'm6',
        name: 'Samosas',
        description: 'Crispy fried pastries with potato and pea filling (3 pieces)',
        price: 60,
        image: '/food-images/samosas.jpg',
        rating: 4.5,
        category: 'Appetizers'
      },
      {
        id: 'm7',
        name: 'Chole Bhature',
        description: 'Spiced chickpeas with fluffy deep-fried bread',
        price: 150,
        image: '/food-images/chole-bhature.jpg',
        rating: 4.7,
        category: 'Mains'
      },
    ]
  },
  {
    id: '3',
    name: 'Verde Fresh',
    image: '/food-images/veg-biryani.jpg',
    rating: 4.7,
    distance: 0.8,
    deliveryTime: '20-25 mins',
    cuisine: ['Healthy', 'Vegan'],
    priceRange: 2,
    isOpen: true,
    minOrder: 12,
    menu: [
      {
        id: 'm8',
        name: 'Vegetable Biryani',
        description: 'Fragrant basmati rice with roasted vegetables and Indian spices',
        price: 220,
        image: '/food-images/veg-biryani.jpg',
        rating: 4.6,
        category: 'Mains'
      },
      {
        id: 'm9',
        name: 'Mango Lassi',
        description: 'Refreshing yogurt-based drink with fresh mango and cardamom',
        price: 90,
        image: '/food-images/mango-lassi.jpg',
        rating: 4.4,
        category: 'Drinks'
      },
    ]
  },
  {
    id: '4',
    name: 'Pizza Hut',
    image: '/food-images/paneer-pizza.jpg',
    rating: 4.5,
    distance: 1.5,
    deliveryTime: '30-35 mins',
    cuisine: ['Italian', 'Pizza'],
    priceRange: 3,
    isOpen: true,
    minOrder: 18,
    menu: [
      {
        id: 'm10',
        name: 'Paneer Pizza',
        description: 'Crispy crust with paneer, onions, peppers and special pizza sauce',
        price: 350,
        image: '/food-images/paneer-pizza.jpg',
        rating: 4.7,
        category: 'Pizza'
      },
      {
        id: 'm11',
        name: 'Spicy Tandoori Chicken Pizza',
        description: 'Tandoori chicken with onions and capsicum on thin crust',
        price: 420,
        image: '/food-images/tandoori-pizza.jpg',
        rating: 4.6,
        category: 'Pizza'
      },
    ]
  },
];

export const deals: Deal[] = [
  {
    id: 'd1',
    itemName: 'Chicken Biryani',
    restaurant: 'Big Bowl',
    originalPrice: 450,
    discountedPrice: 320,
    discount: 30,
    image: '/food-images/veg-biryani.jpg',
    timeLeft: '2 hours',
    quantity: 5,
  },
  {
    id: 'd2',
    itemName: 'Paneer Pizza',
    restaurant: 'Pizza Hut',
    originalPrice: 350,
    discountedPrice: 245,
    discount: 30,
    image: '/food-images/paneer-pizza.jpg',
    timeLeft: '1 hour',
    quantity: 3,
  },
  {
    id: 'd3',
    itemName: 'Tandoori Chicken',
    restaurant: 'Spice Haven',
    originalPrice: 280,
    discountedPrice: 168,
    discount: 40,
    image: '/food-images/tandoori-chicken.jpg',
    timeLeft: '45 mins',
    quantity: 8,
  },
];

export const foodMoods = [
  { id: 'comfort', label: 'Comfort Food', emoji: '🍔' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'party', label: 'Party', emoji: '🎉' },
];

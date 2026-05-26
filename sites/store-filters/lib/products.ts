export type Category = 'Электроника' | 'Книги' | 'Одежда' | 'Дом' | 'Спорт'
export type Color = 'красный' | 'синий' | 'чёрный' | 'белый' | 'зелёный'

export interface Product {
  id: string
  name: string
  category: Category
  brand: string
  price: number
  inStock: boolean
  color: Color
  emoji: string
  addedAt: number
}

export const CATEGORIES: Category[] = ['Электроника', 'Книги', 'Одежда', 'Дом', 'Спорт']
export const BRANDS: string[] = ['Sony', 'Samsung', 'Apple', 'Nike', 'Adidas', 'IKEA', 'Bosch', 'Эксмо']
export const COLORS: Color[] = ['красный', 'синий', 'чёрный', 'белый', 'зелёный']

// 45 hand-crafted products across all categories/brands/colors.
// addedAt is a monotonic counter used for "Новинки" sort.
export const PRODUCTS: Product[] = [
  // Электроника
  { id: 'e1',  name: 'Наушники Sony WH-1000XM5', category: 'Электроника', brand: 'Sony',    price: 32990, inStock: true,  color: 'чёрный',  emoji: '🎧', addedAt: 45 },
  { id: 'e2',  name: 'Телевизор Samsung 55"',     category: 'Электроника', brand: 'Samsung', price: 64990, inStock: true,  color: 'чёрный',  emoji: '📺', addedAt: 30 },
  { id: 'e3',  name: 'Смартфон Apple iPhone 15',  category: 'Электроника', brand: 'Apple',   price: 89990, inStock: false, color: 'белый',   emoji: '📱', addedAt: 44 },
  { id: 'e4',  name: 'Колонка Sony SRS-XB23',     category: 'Электроника', brand: 'Sony',    price: 8490,  inStock: true,  color: 'синий',   emoji: '🔊', addedAt: 10 },
  { id: 'e5',  name: 'Планшет Samsung Tab S9',    category: 'Электроника', brand: 'Samsung', price: 54990, inStock: true,  color: 'зелёный', emoji: '📲', addedAt: 28 },
  { id: 'e6',  name: 'Часы Apple Watch SE',       category: 'Электроника', brand: 'Apple',   price: 27990, inStock: true,  color: 'красный', emoji: '⌚', addedAt: 37 },
  { id: 'e7',  name: 'Фитнес-браслет Bosch Fit',  category: 'Электроника', brand: 'Bosch',   price: 3990,  inStock: false, color: 'чёрный',  emoji: '⌚', addedAt: 5  },
  { id: 'e8',  name: 'Камера Sony Alpha 6400',    category: 'Электроника', brand: 'Sony',    price: 76990, inStock: true,  color: 'чёрный',  emoji: '📷', addedAt: 18 },
  { id: 'e9',  name: 'Чайник Bosch Smart',        category: 'Электроника', brand: 'Bosch',   price: 5490,  inStock: true,  color: 'белый',   emoji: '🫖', addedAt: 12 },

  // Книги
  { id: 'b1',  name: 'Книга "Чистый код"',         category: 'Книги', brand: 'Эксмо',   price: 1490, inStock: true,  color: 'белый',   emoji: '📘', addedAt: 22 },
  { id: 'b2',  name: 'Роман "Война и мир"',         category: 'Книги', brand: 'Эксмо',   price: 990,  inStock: true,  color: 'красный', emoji: '📕', addedAt: 8  },
  { id: 'b3',  name: 'Атлас мира Apple Maps Print', category: 'Книги', brand: 'Apple',   price: 2490, inStock: false, color: 'синий',   emoji: '📗', addedAt: 14 },
  { id: 'b4',  name: 'Кулинарная книга Bosch',      category: 'Книги', brand: 'Bosch',   price: 1290, inStock: true,  color: 'зелёный', emoji: '📙', addedAt: 6  },
  { id: 'b5',  name: 'Учебник по дизайну Эксмо',    category: 'Книги', brand: 'Эксмо',   price: 1990, inStock: true,  color: 'чёрный',  emoji: '📕', addedAt: 31 },
  { id: 'b6',  name: 'Бизнес-роман от Samsung Pub', category: 'Книги', brand: 'Samsung', price: 1690, inStock: true,  color: 'белый',   emoji: '📓', addedAt: 19 },
  { id: 'b7',  name: 'Sony Photo Album 2024',       category: 'Книги', brand: 'Sony',    price: 3490, inStock: false, color: 'синий',   emoji: '📔', addedAt: 9  },
  { id: 'b8',  name: 'Энциклопедия спорта Nike',    category: 'Книги', brand: 'Nike',    price: 2190, inStock: true,  color: 'красный', emoji: '📒', addedAt: 25 },

  // Одежда
  { id: 'c1',  name: 'Кроссовки Nike Air Max',      category: 'Одежда', brand: 'Nike',    price: 12990, inStock: true,  color: 'белый',   emoji: '👟', addedAt: 41 },
  { id: 'c2',  name: 'Футболка Adidas Originals',   category: 'Одежда', brand: 'Adidas',  price: 2990,  inStock: true,  color: 'синий',   emoji: '👕', addedAt: 27 },
  { id: 'c3',  name: 'Куртка Nike Windrunner',      category: 'Одежда', brand: 'Nike',    price: 8990,  inStock: false, color: 'зелёный', emoji: '🧥', addedAt: 16 },
  { id: 'c4',  name: 'Шорты Adidas Run',            category: 'Одежда', brand: 'Adidas',  price: 1990,  inStock: true,  color: 'чёрный',  emoji: '🩳', addedAt: 11 },
  { id: 'c5',  name: 'Толстовка Apple Logo Tee',    category: 'Одежда', brand: 'Apple',   price: 4990,  inStock: true,  color: 'красный', emoji: '🧥', addedAt: 33 },
  { id: 'c6',  name: 'Кепка Sony Music Fan',        category: 'Одежда', brand: 'Sony',    price: 1490,  inStock: true,  color: 'чёрный',  emoji: '🧢', addedAt: 13 },
  { id: 'c7',  name: 'Носки Samsung Sport 3pcs',    category: 'Одежда', brand: 'Samsung', price: 590,   inStock: true,  color: 'белый',   emoji: '🧦', addedAt: 4  },
  { id: 'c8',  name: 'Перчатки Adidas Winter',      category: 'Одежда', brand: 'Adidas',  price: 1890,  inStock: false, color: 'зелёный', emoji: '🧤', addedAt: 7  },

  // Дом
  { id: 'h1',  name: 'Стол IKEA Lack',              category: 'Дом', brand: 'IKEA',    price: 2490,  inStock: true,  color: 'белый',   emoji: '🪑', addedAt: 23 },
  { id: 'h2',  name: 'Стул IKEA Adde',              category: 'Дом', brand: 'IKEA',    price: 1290,  inStock: true,  color: 'чёрный',  emoji: '🪑', addedAt: 17 },
  { id: 'h3',  name: 'Холодильник Bosch Serie 4',   category: 'Дом', brand: 'Bosch',   price: 48990, inStock: false, color: 'белый',   emoji: '🧊', addedAt: 26 },
  { id: 'h4',  name: 'Пылесос Samsung Jet',         category: 'Дом', brand: 'Samsung', price: 18990, inStock: true,  color: 'красный', emoji: '🧹', addedAt: 32 },
  { id: 'h5',  name: 'Лампа IKEA Ranarp',           category: 'Дом', brand: 'IKEA',    price: 3490,  inStock: true,  color: 'чёрный',  emoji: '💡', addedAt: 20 },
  { id: 'h6',  name: 'Кофемашина Bosch VeroCup',    category: 'Дом', brand: 'Bosch',   price: 32990, inStock: true,  color: 'чёрный',  emoji: '☕', addedAt: 35 },
  { id: 'h7',  name: 'Подушка IKEA Slumra',         category: 'Дом', brand: 'IKEA',    price: 890,   inStock: true,  color: 'зелёный', emoji: '🛏️', addedAt: 2  },
  { id: 'h8',  name: 'Микроволновка Samsung MS23',  category: 'Дом', brand: 'Samsung', price: 9490,  inStock: false, color: 'синий',   emoji: '📡', addedAt: 24 },
  { id: 'h9',  name: 'Полка IKEA Billy',            category: 'Дом', brand: 'IKEA',    price: 6990,  inStock: true,  color: 'белый',   emoji: '📚', addedAt: 21 },

  // Спорт
  { id: 's1',  name: 'Мяч футбольный Adidas',       category: 'Спорт', brand: 'Adidas',  price: 2990,  inStock: true,  color: 'белый',   emoji: '⚽', addedAt: 36 },
  { id: 's2',  name: 'Гантели Nike 5кг',            category: 'Спорт', brand: 'Nike',    price: 4490,  inStock: true,  color: 'чёрный',  emoji: '🏋️', addedAt: 29 },
  { id: 's3',  name: 'Йога-коврик Adidas',          category: 'Спорт', brand: 'Adidas',  price: 1990,  inStock: false, color: 'синий',   emoji: '🧘', addedAt: 15 },
  { id: 's4',  name: 'Велосипед Bosch eBike',       category: 'Спорт', brand: 'Bosch',   price: 89990, inStock: true,  color: 'красный', emoji: '🚲', addedAt: 42 },
  { id: 's5',  name: 'Скакалка Nike Pro',           category: 'Спорт', brand: 'Nike',    price: 990,   inStock: true,  color: 'зелёный', emoji: '🪢', addedAt: 3  },
  { id: 's6',  name: 'Беговая дорожка Samsung Run', category: 'Спорт', brand: 'Samsung', price: 74990, inStock: false, color: 'чёрный',  emoji: '🏃', addedAt: 38 },
  { id: 's7',  name: 'Шлем Sony VR Sport',          category: 'Спорт', brand: 'Sony',    price: 24990, inStock: true,  color: 'белый',   emoji: '🪖', addedAt: 39 },
  { id: 's8',  name: 'Лыжи Apple Glide Pro',        category: 'Спорт', brand: 'Apple',   price: 18990, inStock: true,  color: 'синий',   emoji: '🎿', addedAt: 34 },
  { id: 's9',  name: 'Эспандер Эксмо Fit',          category: 'Спорт', brand: 'Эксмо',   price: 690,   inStock: true,  color: 'красный', emoji: '💪', addedAt: 1  },
  { id: 's10', name: 'Ракетка Nike Tennis Pro',     category: 'Спорт', brand: 'Nike',    price: 5990,  inStock: true,  color: 'зелёный', emoji: '🎾', addedAt: 40 },
  { id: 's11', name: 'Шахматы IKEA Wood',           category: 'Спорт', brand: 'IKEA',    price: 1990,  inStock: true,  color: 'чёрный',  emoji: '♟️', addedAt: 43 },
]

export interface Item {
  id: string
  name: string
  category: string
  tags: string[]
}

// Mixed dataset: books, products, places, articles. RU + EN names.
export const ITEMS: Item[] = [
  // Books
  { id: 'b1', name: 'War and Peace', category: 'Книги', tags: ['роман', 'tolstoy', 'classic'] },
  { id: 'b2', name: 'Война и мир', category: 'Книги', tags: ['роман', 'толстой', 'классика'] },
  { id: 'b3', name: 'The Great Gatsby', category: 'Книги', tags: ['fitzgerald', 'novel', 'jazz age'] },
  { id: 'b4', name: 'Преступление и наказание', category: 'Книги', tags: ['достоевский', 'classic'] },
  { id: 'b5', name: 'Crime and Punishment', category: 'Книги', tags: ['dostoevsky', 'novel'] },
  { id: 'b6', name: 'Мастер и Маргарита', category: 'Книги', tags: ['булгаков', 'fantasy'] },
  { id: 'b7', name: 'Naive Set Theory', category: 'Книги', tags: ['math', 'halmos', 'logic'] },
  { id: 'b8', name: 'Naïve Bayes Explained', category: 'Книги', tags: ['ml', 'статистика', 'classifier'] },
  { id: 'b9', name: 'Café au Lait Stories', category: 'Книги', tags: ['short stories', 'french'] },
  { id: 'b10', name: 'Brontë Sisters Anthology', category: 'Книги', tags: ['classic', 'english literature'] },
  { id: 'b11', name: 'The Pragmatic Programmer', category: 'Книги', tags: ['software', 'engineering', 'tech'] },
  { id: 'b12', name: 'Clean Code', category: 'Книги', tags: ['martin', 'software', 'craftsmanship'] },

  // Products
  { id: 'p1', name: 'iPhone 15 Pro', category: 'Электроника', tags: ['phone', 'apple', 'смартфон'] },
  { id: 'p2', name: 'Pixel 8', category: 'Электроника', tags: ['phone', 'google', 'android'] },
  { id: 'p3', name: 'MacBook Air M3', category: 'Электроника', tags: ['ноутбук', 'apple', 'laptop'] },
  { id: 'p4', name: 'AirPods Pro 2', category: 'Электроника', tags: ['наушники', 'apple', 'audio'] },
  { id: 'p5', name: 'Magic Mouse', category: 'Электроника', tags: ['мышь', 'apple', 'periphery'] },
  { id: 'p6', name: 'iPad mini 7', category: 'Электроника', tags: ['планшет', 'apple', 'tablet'] },
  { id: 'p7', name: 'Apple Watch Ultra', category: 'Электроника', tags: ['часы', 'apple', 'wearable'] },
  { id: 'p8', name: 'Sony WH-1000XM5', category: 'Электроника', tags: ['наушники', 'sony', 'noise canceling'] },
  { id: 'p9', name: 'Samsung Galaxy S24', category: 'Электроника', tags: ['phone', 'samsung', 'android'] },
  { id: 'p10', name: 'Kindle Paperwhite', category: 'Электроника', tags: ['amazon', 'e-reader', 'книги'] },
  { id: 'p11', name: 'Nintendo Switch OLED', category: 'Электроника', tags: ['игры', 'nintendo', 'console'] },
  { id: 'p12', name: 'Логитеч MX Master 3S', category: 'Электроника', tags: ['мышь', 'logitech', 'office'] },
  { id: 'p13', name: 'Стол IKEA Bekant', category: 'Мебель', tags: ['офис', 'desk', 'ikea'] },
  { id: 'p14', name: 'Кресло Herman Miller Aeron', category: 'Мебель', tags: ['кресло', 'office chair', 'ergonomic'] },
  { id: 'p15', name: 'Лампа Xiaomi Mi Desk', category: 'Освещение', tags: ['лампа', 'led', 'xiaomi'] },

  // Places
  { id: 'l1', name: 'Москва', category: 'Места', tags: ['россия', 'столица', 'moscow'] },
  { id: 'l2', name: 'Saint Petersburg', category: 'Места', tags: ['russia', 'питер', 'спб'] },
  { id: 'l3', name: 'Paris', category: 'Места', tags: ['france', 'париж', 'europe'] },
  { id: 'l4', name: 'Tokyo', category: 'Места', tags: ['japan', 'токио', 'asia'] },
  { id: 'l5', name: 'New York', category: 'Места', tags: ['usa', 'нью-йорк', 'manhattan'] },
  { id: 'l6', name: 'Сан-Франциско', category: 'Места', tags: ['usa', 'california', 'bay area'] },
  { id: 'l7', name: 'Reykjavík', category: 'Места', tags: ['iceland', 'рейкьявик', 'nordic'] },
  { id: 'l8', name: 'Zürich', category: 'Места', tags: ['switzerland', 'цюрих', 'europe'] },
  { id: 'l9', name: 'São Paulo', category: 'Места', tags: ['brazil', 'сан-паулу', 'south america'] },
  { id: 'l10', name: 'Малага', category: 'Места', tags: ['испания', 'malaga', 'costa del sol'] },
  { id: 'l11', name: 'Yerevan', category: 'Места', tags: ['армения', 'ереван', 'caucasus'] },
  { id: 'l12', name: 'Тбилиси', category: 'Места', tags: ['грузия', 'tbilisi', 'caucasus'] },

  // Articles
  { id: 'a1', name: 'How Transformers Work', category: 'Статьи', tags: ['ml', 'attention', 'neural networks'] },
  { id: 'a2', name: 'CSS Grid за 10 минут', category: 'Статьи', tags: ['frontend', 'web', 'верстка'] },
  { id: 'a3', name: 'Введение в Kubernetes', category: 'Статьи', tags: ['devops', 'k8s', 'orchestration'] },
  { id: 'a4', name: 'Rust Ownership Model', category: 'Статьи', tags: ['rust', 'memory', 'systems'] },
  { id: 'a5', name: 'React Server Components', category: 'Статьи', tags: ['react', 'next.js', 'frontend'] },
  { id: 'a6', name: 'Почему монады это просто', category: 'Статьи', tags: ['haskell', 'fp', 'функциональное'] },
  { id: 'a7', name: 'Designing Resilient Systems', category: 'Статьи', tags: ['architecture', 'distributed', 'reliability'] },
  { id: 'a8', name: 'Тёмная сторона микросервисов', category: 'Статьи', tags: ['microservices', 'архитектура', 'devops'] },
  { id: 'a9', name: 'Postgres Indexes Deep Dive', category: 'Статьи', tags: ['db', 'postgres', 'performance'] },
  { id: 'a10', name: 'Война браузеров в 2026', category: 'Статьи', tags: ['browsers', 'web', 'chrome'] },

  // Recipes / food / misc
  { id: 'f1', name: 'Café Mocha Recipe', category: 'Рецепты', tags: ['coffee', 'кофе', 'drink'] },
  { id: 'f2', name: 'Борщ классический', category: 'Рецепты', tags: ['суп', 'soup', 'russian cuisine'] },
  { id: 'f3', name: 'Crème Brûlée', category: 'Рецепты', tags: ['десерт', 'french', 'dessert'] },
  { id: 'f4', name: 'Пельмени домашние', category: 'Рецепты', tags: ['dumplings', 'russian', 'meat'] },
  { id: 'f5', name: 'Sushi Roll Guide', category: 'Рецепты', tags: ['japanese', 'fish', 'rice'] },
  { id: 'f6', name: 'Naive Vinaigrette', category: 'Рецепты', tags: ['salad', 'dressing', 'simple'] },
  { id: 'f7', name: 'Jalapeño Salsa', category: 'Рецепты', tags: ['mexican', 'spicy', 'dip'] },
  { id: 'f8', name: 'Хачапури по-аджарски', category: 'Рецепты', tags: ['грузия', 'georgian', 'bread'] },

  // Movies / shows
  { id: 'm1', name: 'The Matrix', category: 'Кино', tags: ['sci-fi', 'фантастика', 'wachowski'] },
  { id: 'm2', name: 'Брат 2', category: 'Кино', tags: ['балабанов', 'russian cinema', 'drama'] },
  { id: 'm3', name: 'Inception', category: 'Кино', tags: ['nolan', 'sci-fi', 'триллер'] },
  { id: 'm4', name: 'Иван Васильевич меняет профессию', category: 'Кино', tags: ['гайдай', 'комедия', 'classic'] },
  { id: 'm5', name: 'Pulp Fiction', category: 'Кино', tags: ['tarantino', 'crime', 'culte'] },
]

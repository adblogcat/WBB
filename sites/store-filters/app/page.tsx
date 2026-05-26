'use client'
import * as React from 'react'
import {
  PRODUCTS,
  CATEGORIES,
  BRANDS,
  COLORS,
  type Product,
  type Category,
  type Color,
} from '@/lib/products'

type SortKey = 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

const PRICE_MIN = 0
const PRICE_MAX = 100000

const COLOR_HEX: Record<Color, string> = {
  'красный': '#dc2626',
  'синий':   '#2563eb',
  'чёрный':  '#18181b',
  'белый':   '#f4f4f5',
  'зелёный': '#16a34a',
}

export default function CatalogPage() {
  const [category, setCategory] = React.useState<'Все' | Category>('Все')
  const [brand, setBrand] = React.useState<'Все' | string>('Все')
  const [priceMin, setPriceMin] = React.useState<number>(PRICE_MIN)
  const [priceMax, setPriceMax] = React.useState<number>(PRICE_MAX)
  const [selectedColors, setSelectedColors] = React.useState<Color[]>([])
  // BUG STORE-004: defaultChecked={true} stoit ниже в JSX, но state инициализирован false.
  // Из-за этого чекбокс выглядит включённым, а фильтр не работает — товары "нет в наличии"
  // всё равно показываются.
  const [onlyInStock, setOnlyInStock] = React.useState<boolean>(false)
  const [sort, setSort] = React.useState<SortKey>('newest')

  // BUG STORE-001: category onChange использует previous state вместо e.target.value.
  // Из-за этого первое переключение применяет старое значение, нужно изменить дважды,
  // чтобы фильтр действительно сработал на новой категории.
  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(category as 'Все' | Category)
  }

  function handleColorToggle(color: Color) {
    // BUG STORE-006: чекбоксы цвета взаимоисключающие — клик заменяет массив на [color]
    // вместо переключения членства. Должно работать как OR (несколько цветов одновременно).
    setSelectedColors([color])
  }

  const filtered = React.useMemo<Product[]>(() => {
    return PRODUCTS.filter(p => {
      const catOk = category === 'Все' || p.category === category
      const brandOk = brand === 'Все' || p.brand === brand
      // BUG STORE-003: проверяется только нижняя граница цены, верхняя игнорируется.
      // Сдвиг правого ползунка max не убирает товары дороже выбранного значения.
      const priceOk = p.price >= priceMin
      const colorOk = selectedColors.length === 0 || selectedColors.includes(p.color)
      const stockOk = !onlyInStock || p.inStock
      // BUG STORE-002: между предикатами категории и бренда стоит || вместо &&.
      // Из-за этого "Электроника" + "Sony" показывает Sony из всех категорий
      // (книги, одежда, спорт), ломая AND-логику фильтров.
      return (catOk || brandOk) && priceOk && colorOk && stockOk
    })
  }, [category, brand, priceMin, priceMax, selectedColors, onlyInStock])

  const sorted = React.useMemo<Product[]>(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'price-asc':  arr.sort((a, b) => a.price - b.price); break
      case 'price-desc': arr.sort((a, b) => b.price - a.price); break
      case 'name-asc':   arr.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break
      case 'newest':     arr.sort((a, b) => b.addedAt - a.addedAt); break
    }
    return arr
  }, [filtered, sort])

  return (
    <div className="container">
      <div className="layout">
        <aside className="sidebar">
          <h2>Фильтры</h2>

          <div className="filter-group">
            <label className="filter-label" htmlFor="f-category">Категория</label>
            <select id="f-category" value={category} onChange={handleCategoryChange}>
              <option value="Все">Все</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="f-brand">Бренд</label>
            <select
              id="f-brand"
              value={brand}
              onChange={e => setBrand(e.target.value)}
            >
              <option value="Все">Все</option>
              {BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Цена, ₽</label>
            <div className="price-row">
              <span>от {priceMin.toLocaleString('ru-RU')}</span>
              <span>до {priceMax.toLocaleString('ru-RU')}</span>
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={priceMin}
              onChange={e => setPriceMin(Number(e.target.value))}
              aria-label="Минимальная цена"
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              aria-label="Максимальная цена"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Цвет</label>
            <div className="checkbox-list">
              {COLORS.map(c => (
                <label className="checkbox-row" key={c}>
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(c)}
                    onChange={() => handleColorToggle(c)}
                  />
                  <span className="swatch" style={{ background: COLOR_HEX[c] }} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="checkbox-row">
              {/* BUG STORE-004: defaultChecked={true}, но state = false — рассинхрон UI/логики. */}
              <input
                type="checkbox"
                defaultChecked={true}
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
              />
              <span>Только в наличии</span>
            </label>
          </div>
        </aside>

        <section className="main">
          <div className="toolbar">
            {/* BUG STORE-005: счётчик показывает PRODUCTS.length (всего), а не filtered/sorted.length. */}
            <div className="counter">Найдено: {PRODUCTS.length} товаров</div>
            <div className="sort">
              <label htmlFor="f-sort">Сортировка:</label>
              <select
                id="f-sort"
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
              >
                <option value="price-asc">Цена ↑</option>
                <option value="price-desc">Цена ↓</option>
                <option value="name-asc">Название А-Я</option>
                <option value="newest">Новинки</option>
              </select>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="empty">Ничего не найдено. Попробуйте изменить фильтры.</div>
          ) : (
            <div className="grid">
              {sorted.map(p => (
                <div className="card" key={p.id}>
                  <div className="card-thumb">{p.emoji}</div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-meta">
                    <span className="pill">{p.category}</span>
                    <span className="pill">{p.brand}</span>
                    <span className="pill">
                      <span className="swatch" style={{ background: COLOR_HEX[p.color] }} />
                      {p.color}
                    </span>
                  </div>
                  <div className="card-price">{p.price.toLocaleString('ru-RU')}₽</div>
                  <div className={p.inStock ? 'card-stock in' : 'card-stock out'}>
                    {p.inStock ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

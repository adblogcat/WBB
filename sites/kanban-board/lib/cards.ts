export type ColumnId = 'backlog' | 'inprogress' | 'review' | 'done'
export type Label = 'Bug' | 'Feature' | 'Chore' | 'Docs'
export type Priority = 'low' | 'med' | 'high'

export interface Card {
  id: string
  title: string
  assignee: string
  label: Label
  priority: Priority
  column: ColumnId
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'backlog', title: 'Бэклог' },
  { id: 'inprogress', title: 'В работе' },
  { id: 'review', title: 'На ревью' },
  { id: 'done', title: 'Готово' },
]

export const LABELS: Label[] = ['Bug', 'Feature', 'Chore', 'Docs']

export const INITIAL_CARDS: Card[] = [
  // backlog (5)
  { id: 'c1', title: 'Починить пагинацию в списке заказов', assignee: 'АЛ', label: 'Bug', priority: 'high', column: 'backlog' },
  { id: 'c2', title: 'Добавить экспорт отчётов в CSV', assignee: 'ИВ', label: 'Feature', priority: 'med', column: 'backlog' },
  { id: 'c3', title: 'Обновить README по деплою', assignee: 'МК', label: 'Docs', priority: 'low', column: 'backlog' },
  { id: 'c4', title: 'Удалить устаревшие миграции БД', assignee: 'ОС', label: 'Chore', priority: 'low', column: 'backlog' },
  { id: 'c5', title: 'Тёмная тема для дашборда', assignee: 'ЕП', label: 'Feature', priority: 'med', column: 'backlog' },

  // inprogress (5)
  { id: 'c6', title: 'Авторизация через OAuth Google', assignee: 'АЛ', label: 'Feature', priority: 'high', column: 'inprogress' },
  { id: 'c7', title: 'Краш на iOS при пуш-уведомлении', assignee: 'ДН', label: 'Bug', priority: 'high', column: 'inprogress' },
  { id: 'c8', title: 'Рефакторинг модуля платежей', assignee: 'ИВ', label: 'Chore', priority: 'med', column: 'inprogress' },
  { id: 'c9', title: 'Документация API v2', assignee: 'МК', label: 'Docs', priority: 'med', column: 'inprogress' },
  { id: 'c10', title: 'Лимит запросов на endpoint /search', assignee: 'ОС', label: 'Feature', priority: 'low', column: 'inprogress' },

  // review (4)
  { id: 'c11', title: 'Фикс утечки памяти в воркере', assignee: 'ДН', label: 'Bug', priority: 'high', column: 'review' },
  { id: 'c12', title: 'Метрики Prometheus для backend', assignee: 'АЛ', label: 'Feature', priority: 'med', column: 'review' },
  { id: 'c13', title: 'Обновить зависимости npm', assignee: 'ЕП', label: 'Chore', priority: 'low', column: 'review' },
  { id: 'c14', title: 'Описание архитектуры микросервисов', assignee: 'МК', label: 'Docs', priority: 'low', column: 'review' },

  // done (4)
  { id: 'c15', title: 'Логотип в навигации обновлён', assignee: 'ЕП', label: 'Chore', priority: 'low', column: 'done' },
  { id: 'c16', title: 'Багфикс кнопки "Войти" на мобилке', assignee: 'ДН', label: 'Bug', priority: 'med', column: 'done' },
  { id: 'c17', title: 'Welcome email для новых юзеров', assignee: 'ИВ', label: 'Feature', priority: 'med', column: 'done' },
  { id: 'c18', title: 'CHANGELOG для релиза 2.4.0', assignee: 'МК', label: 'Docs', priority: 'low', column: 'done' },
]

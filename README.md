# Frontend Cost Estimator

Личный инструмент для оценки стоимости и сроков фронтенд-разработки (верстка/интерактив) по экранам и опциям качества.

## Возможности

- Оценка по экранам: simple / medium / hard / pro
- Профили ставок: Junior / Middle / Senior
- Учет опций:
  - адаптив (tablet / mobile)
  - pixel perfect
  - accessibility
  - SEO/семантика
  - performance
  - cross-browser
  - формы/валидация
  - API-интеграция
  - анимации
  - риск / срочность
- Расчёт сроков по нормам
- История проектов (с итогами)
- Undo удаления
- Экспорт / импорт JSON (для бэкапа)
- Автосохранение в localStorage

## Стек

- React
- Vite
- useReducer + selectors (разделение UI и бизнес-логики)
- localStorage persistence

## Запуск локально

```bash
npm install
npm run dev
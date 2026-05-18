
## Описание проекта

В рамках обучения курса "Мидл фронтенд-разработчик и модуль по React"
В первом модуле создаем: веб-приложение «Чат» 

## Vite + Handlebars + Sass (SCSS)

### Быстрый старт

```bash
npm install
npm run start
```

Откроется `http://localhost:3000/`.

1) Создал проект на Vite (шаблон `vanilla-ts`).

```bash
npm create vite@latest . -- --template vanilla-ts
npm install
```

2) Подключил Sass и Handlebars-шаблонизатор через плагин.

```bash
npm i -D sass vite-plugin-handlebars
```

3) Настроил Vite:
- порт **3000** (`server.port`)
- Handlebars partials + “контекст” (данные в шаблон) — `vite-plugin-handlebars`

Файл: `vite.config.ts`.

### Спринт 2 — что реализовано
- Компонентная архитектура на базовом классе `Block`
- Регистрация компонентов через `registerComponent` для Handlebars
- Клиентский роутинг и переходы без перезагрузки страницы
- Валидация форм:
  - проверка полей на `focusout` (blur)
  - полная проверка формы на `submit`
  - отображение ошибок под полями
  - сбор данных формы через `FormData`
- Настроены линтеры:
  - ESLint (TypeScript)
  - Stylelint (SCSS)
  - проверка типов TypeScript (`tsc --noEmit`)
- Структура проекта разнесена по слоям: `core`, `components`, `pages`, `app`, `utils`, `styles`

### Стек
- TypeScript
- Vite
- Handlebars
- SCSS (Sass)

### Структура проекта
```bash
src/
  app/          # маршрутизация, renderPage/navigate
  core/         # Block, register-component
  components/   # переиспользуемые UI-компоненты
  pages/        # страницы приложения
  utils/        # валидация и утилиты
  styles/       # глобальные и компонентные стили
```

### Команды
```bash
npm run start    # разработка, http://localhost:3000
npm run build    # сборка в dist/
npm run preview  # локальный просмотр dist/, тоже на 3000 (см. vite.config.ts)
npm run lint        # eslint + stylelint + typecheck
npm run lint:fix    # автофикс eslint/stylelint
npm run lint:eslint
npm run lint:style
npm run lint:types

```

### Макет Figma
[Макет Figma](https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=1-537&t=GvDNWCAqe3GZ47HC-0)


### Проект на Netlify
[Веб-приложение «Чат»](https://taupe-pixie-c23730.netlify.app/)

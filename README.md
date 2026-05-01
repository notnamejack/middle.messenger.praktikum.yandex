
## Описание проекта

В рамках обучения курса "Мидл фронтенд-разработчик и модуль по React"
В первом модуле создаем: веб-приложение «Чат» 

## Vite + Handlebars + Sass (SCSS)

### Быстрый старт

```bash
npm install
npm run dev
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

### Команды

```bash
npm run start      # разработка, http://localhost:3000
npm run build    # сборка в dist/
npm run preview  # локальный просмотр dist/, тоже на 3000 (см. vite.config.ts)
```

### Макет Figma

`https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=1-537&t=GvDNWCAqe3GZ47HC-0`


### Проект на Netlify

`https://taupe-pixie-c23730.netlify.app/`
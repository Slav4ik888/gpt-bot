# Используем официальный образ Node.js версии 14
FROM node:16-alpine

# Создаем директорию приложения внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем все остальные файлы проекта
COPY . .

# Открываем порт 3000
ENV PORT=3000
EXPOSE $PORT

# Запускаем приложение
CMD [ "npm", "start" ]

# Commands
# docker images - посмотреть существующие образы
# docker stop grp-bot

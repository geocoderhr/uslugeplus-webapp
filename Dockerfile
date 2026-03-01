FROM nginx:alpine
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY js /usr/share/nginx/html/js
COPY IMG_3034.jpeg /usr/share/nginx/html/IMG_3034.jpeg
COPY app.js /usr/share/nginx/html/app.js
EXPOSE 80

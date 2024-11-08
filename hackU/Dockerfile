FROM oven/bun:debian 
# FROM node:22.11.0-bookworm-slim
# FROM ubuntu:24.04
WORKDIR /app

# COPY ./hackU /hackU/
# COPY package.json package-lock.json ./
COPY package.json bun.lockb ./
# RUN npm install -g bun 
# RUN sudo apt-get install curl && curl -fsSL https://bun.sh/install | sh
# RUN npm i
RUN bun i
# EXPOSE 3000
ENV CI=true

CMD ["bun", "run", "dev"]
# SHELL ["/bin/sh", "-c"]
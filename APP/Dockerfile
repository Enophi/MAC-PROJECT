FROM node:11-alpine

RUN apk update && apk add python alpine-sdk

# Création du répertoire
RUN mkdir /home/node/app
WORKDIR /home/node/app

# Installation des dépendances
COPY package.json .
RUN npm install

# Copie des source
COPY src .

EXPOSE 3000
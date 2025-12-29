# 📦 Backend – README.md
## 🧠 Descripción

Este repositorio contiene el backend de una red social, desarrollado con NestJS, GraphQL y MongoDB, enfocado en escalabilidad, seguridad y tiempo real.

Provee funcionalidades como:

- Autenticación con JWT y cookies HttpOnly

- Publicación y comentarios en forma de hilos

- Likes y métricas

- Seguidores / seguidos

- Subida de archivos

- Notificaciones en tiempo real con GraphQL Subscriptions

- Moderación y denuncias de contenido

## 🏗️ Stack tecnológico

- NestJS

- GraphQL (Code First)

- MongoDB + Mongoose

- Apollo Server

- JWT + Refresh Token

- GraphQL Upload

- WebSockets (Subscriptions)

- TypeScript


## 🗂️ Arquitectura general
```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── post/
│   ├── follow/
│   ├── notification/
│   ├── file/
│   └── report/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
├── graphql/
└── main.ts

```
Cada módulo está desacoplado y sigue el patrón:

- resolver

- service

- entity / schema

- dto / input

### 🔐 Autenticación

- Login con JWT

- Tokens almacenados en cookies HttpOnly

- Refresh automático del access token

- Protección contra XSS y CSRF

- Contexto GraphQL con usuario autenticado

### 📝 Posts y comentarios

Un post puede ser:

- raíz (feed)

- o respuesta a otro post (replyTo)

- Permite conversaciones encadenadas

- Soporte para:

  - replies directos

  - ancestros

  - paginación por cursor

### ❤️ Likes

- Like / dislike sobre posts

- Contador desacoplado

- Preparado para:

  - optimistic UI

  - refetch selectivo

  - subscriptions

### 🔔 Notificaciones (tiempo real)

GraphQL Subscriptions

Emisión de eventos livianos (IDs)

Escalable para alta concurrencia

Ideal para feeds y alertas en tiempo real

### 📁 Subida de archivos

GraphQL Upload

- Validación de tamaño y tipo

- Asociación con posts y usuarios

- Compatible con compresión previa desde frontend

### 🚨 Moderación y denuncias

- Denuncias por usuarios

- Registro de reportes

- Soft delete de posts

- Eliminación por usuario o administrador

- Auditoría de contenido

## ⚙️ Variables de entorno
```

```
## 🚀 Instalación y ejecución
```
pnpm install
pnpm run start:dev
```

## Servidor disponible en:
```
http://localhost:3001/graphql
```
## 📌 Notas

Compatible con entornos locales y túneles (ngrok)

Enfoque en buenas prácticas y escalabilidad
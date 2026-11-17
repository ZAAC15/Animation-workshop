# Taller de movimiento

Aplicación móvil educativa para explorar siete interacciones y animaciones con React Native, Expo y Reanimated. Toda la interfaz está en español y se adapta a pantallas móviles.

## Requisitos

- Node.js 22.13 o posterior
- npm
- Expo Go compatible con SDK 58, o un emulador Android/iOS

## Puesta en marcha

```bash
npm install
npx expo start
```

Abre el proyecto desde Expo Go o inicia un emulador con `npm run android` o `npm run ios`. Para abrir la versión web, usa `npm run web`.

## Prácticas

1. Arrastrar una figura y ver cómo rota según la dirección.
2. Indicador circular y barra de progreso en un ciclo continuo.
3. Desplazar, ampliar y rotar una lámina con gestos multitáctiles.
4. Reducir el tamaño de una figura al pulsarla y recuperar la escala con rebote.
5. Recorrer un carrusel horizontal con transiciones de escala y rotación.
6. Activar una sacudida al agitar el dispositivo mediante el acelerómetro. El botón de demostración permite probarla en escritorio.
7. Acceder a cada pantalla desde el menú lateral.

La ilustración de la práctica multitáctil está compuesta localmente con vistas nativas; no necesita descargar imágenes. El acelerómetro funciona en dispositivos compatibles y requiere permiso de movimiento en iOS.

## Tecnologías

- Expo SDK 58
- React Native 0.88
- React Native Reanimated 4
- React Native Gesture Handler 3
- Expo Sensors

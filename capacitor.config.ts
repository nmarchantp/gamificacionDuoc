import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Cambia esto si tienes un ID específico para la app
  appName: 'gamificacionDuoc',
  webDir: 'www',
  bundledWebRuntime: false, // Evita incluir Capacitor Web Runtime si ya estás usando un framework como Ionic

  server: {
    androidScheme: 'https', // Usa HTTPS en Android para mayor compatibilidad
  },

  android: {
    allowMixedContent: true, // Permite contenido HTTP en Android si consumes APIs HTTP
    backgroundColor: '#FFFFFF', // Define un color de fondo predeterminado
  },

  ios: {
    contentInset: 'always', // Ajusta el espacio entre el contenido y la barra superior en iOS
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Tiempo que se mostrará la pantalla de carga
      launchAutoHide: true, // Oculta automáticamente la pantalla de carga
      backgroundColor: '#ffffffff', // Color de fondo para la pantalla de carga
      androidScaleType: 'CENTER_CROP', // Cómo se ajustará la imagen en Android
      showSpinner: false, // Oculta el spinner de carga en la pantalla inicial
    },
    CapacitorStorage: {
      "iosDatabaseLocation": "Library/CapacitorDatabase",
      "androidDatabaseLocation": "default", // Ubicación de la base de datos para almacenamiento en Android
      "logging": true 
    },
  },
};

export default config;

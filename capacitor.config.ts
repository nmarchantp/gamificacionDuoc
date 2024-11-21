import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.duoc.PGY4121', 
  appName: 'gamificacionDuoc',
  webDir: 'www',
  bundledWebRuntime: false, 

  server: {
    androidScheme: 'https', 
  },

  android: {
    allowMixedContent: true, 
    backgroundColor: '#FFFFFF', 
  },

  ios: {
    contentInset: 'always', 
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
      "androidDatabaseLocation": "default",
      "logging": true 
    },
  },
};

export default config;

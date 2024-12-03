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
      launchShowDuration: 0,
      launchAutoHide: true, 
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false, 
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      splashFullScreen: true,
      layoutName:"lauch_screen",
      useDialog: false,
      
    },
    CapacitorStorage: {
      "iosDatabaseLocation": "Library/CapacitorDatabase",
      "androidDatabaseLocation": "default",
      "logging": true 
    },
  },
};

export default config;

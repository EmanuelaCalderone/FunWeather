export default {
  expo: {
    name: "Fun Weather",
    slug: "FunWeather",
    version: "1.1.0",
    orientation: "default",
    scheme: "funweather",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    // icona e splash globali
    icon: "./app/assets/images/icon.png",
    splash: {
      image: "./app/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#194350"
    },

    ios: {
      bundleIdentifier: "com.anonymous.FunWeather",
      buildNumber: "2",
      supportsTablet: true,
      infoPlist: {
        UILaunchStoryboardName: "SplashScreen",
        NSLocationWhenInUseUsageDescription:
          "Usiamo la tua posizione per mostrarti il meteo locale.",
        NSUserNotificationUsageDescription:
          "Mostriamo una notifica giornaliera sul meteo alle 10:00.",
        UISupportedInterfaceOrientations: [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight"
        ]
      },
      // file localizzati InfoPlist.strings
      assetBundlePatterns: ["ios/**/*.strings"]
    },

    android: {
      edgeToEdgeEnabled: true,
      icon: "./app/assets/images/iconAndroid.png",
      package: "com.anonymous.FunWeather",
      versionCode: 1,
      supportsTablet: true,
      splash: {
        image: "./app/assets/images/splash_android.png",
        resizeMode: "contain",
        backgroundColor: "#194350"
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "POST_NOTIFICATIONS" // Android 13+
      ]
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./app/assets/images/icon.png"
    },

    plugins: [
      "expo-router",
      "expo-build-properties",
      "expo-font",
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./app/assets/images/iconAndroid.png",
          color: "#194350",
          mode: "default",
          useNextNotificationsApi: true
        }
      ]
    ],

    experiments: {
      typedRoutes: true
    },

    extra: {
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
      eas: {
        projectId: "259a77ba-9fa3-4548-bc98-bbb0131b806a"
      }
    }
  }
};

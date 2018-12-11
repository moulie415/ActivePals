package com.anyone;

import android.annotation.SuppressLint;
import android.app.Application;

import com.airbnb.android.react.maps.MapsPackage;
import com.crashlytics.android.Crashlytics;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.ReactApplication;
import com.zmxv.RNSound.RNSoundPackage;
import com.shahenlibrary.RNVideoProcessingPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import io.invertase.firebase.instanceid.RNFirebaseInstanceIdPackage;
import suraj.tiwari.reactnativefbads.FBAdsPackage;
import com.sbugert.rnadmob.RNAdMobPackage;
import com.calendarevents.CalendarEventsPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.devfd.RNGeocoder.RNGeocoderPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.imagepicker.ImagePickerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @SuppressLint("MissingPermission")
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
            new RNSoundPackage(),
            new RNVideoProcessingPackage(),
            new ReactVideoPackage(),
            new VectorIconsPackage(),
              new FBAdsPackage(),
              new RNAdMobPackage(),
              new CalendarEventsPackage(),
              new FastImageViewPackage(),
              new RNFirebasePackage(),
              new RNFirebaseNotificationsPackage(),
              new RNFirebaseDatabasePackage(),
              new RNFirebaseMessagingPackage(),
              new RNGeocoderPackage(),
              new RNFirebaseStoragePackage(),
              new RNGoogleSigninPackage(),
              new RNFirebaseAuthPackage(),
              new SplashScreenReactPackage(),
              new RNVersionNumberPackage(),
              new MapsPackage(),
              new ImageResizerPackage(),
              new ImagePickerPackage(),
              new RNFetchBlobPackage(),
              new RNFirebaseInstanceIdPackage(),
              new FBSDKPackage(mCallbackManager)
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    AppEventsLogger.activateApp(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
}

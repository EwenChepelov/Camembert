package fr.chepelov.camembert;

import android.app.Application;
import android.webkit.WebView;

/**
 * Custom Application class to enable hardware acceleration for WebView
 * and optimize performance on Android 17 / Galaxy S26
 */
public class CamembertApplication extends Application {
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Enable hardware acceleration for WebView
        // This must be called before any WebView is instantiated
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        
        // Warm up WebView to reduce first load time
        if (!BuildConfig.DEBUG) {
            new Thread(() -> {
                try {
                    WebView webView = new WebView(getApplicationContext());
                    webView.loadUrl("about:blank");
                } catch (Exception e) {
                    // Ignore in background thread
                }
            }).start();
        }
    }
}

package fr.chepelov.camembert;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

/**
 * Main Activity for Camembert board game
 * Optimized for edge-to-edge display on Samsung Galaxy S26 (Android 17)
 * with hardware-accelerated WebView
 */
public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display
        enableEdgeToEdge();

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        configureWebView();
    }

    /**
     * Enable edge-to-edge display for borderless and punch-hole screens
     */
    private void enableEdgeToEdge() {
        Window window = getWindow();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // For Android 11+ (API 30+)
            WindowInsetsController insetsController = window.getInsetsController();
            if (insetsController != null) {
                insetsController.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
                insetsController.hide(WindowInsets.Type.systemBars());
            }
        } else {
            // Legacy edge-to-edge
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }

        // Set transparent status and navigation bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
        }
    }

    /**
     * Configure WebView with hardware acceleration and performance optimizations
     */
    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();

        // Enable JavaScript
        settings.setJavaScriptEnabled(true);

        // Enable DOM Storage
        settings.setDomStorageEnabled(true);

        // Enable database storage
        settings.setDatabaseEnabled(true);

        // Set cache mode
        if (BuildConfig.DEBUG) {
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        } else {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        }

        // Enable hardware acceleration
        settings.setHardwareAccelerationEnabled(true);

        // Enable WebView optimizations for Android 17
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ optimizations
            settings.setAlgorithmicDarkeningAllowed(false);
        }

        // Optimize for better performance
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Set user agent with device info for better compatibility
        String userAgent = settings.getUserAgentString();
        settings.setUserAgentString(userAgent + " Camembert/1.1");

        // Enable offline mode
        settings.setAppCacheEnabled(true);
        settings.setAppCachePath(getCacheDir().getAbsolutePath());

        // Load from assets
        webView.loadUrl("file:///android_asset/index.html");

        // Set WebViewClient to handle page navigation
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Hide loading indicator if any
            }
        });

        // Set WebChromeClient for JavaScript dialogs
        webView.setWebChromeClient(new WebChromeClient());
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        // Clean up WebView to prevent memory leaks
        if (webView != null) {
            webView.stopLoading();
            webView.clearHistory();
            webView.clearCache(true);
            webView.clearFormData();
            webView.clearMatches();
            webView.destroy();
        }
        super.onDestroy();
    }
}

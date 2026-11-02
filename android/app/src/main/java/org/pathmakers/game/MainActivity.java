package org.pathmakers.game;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

// The whole game is one self-contained page (assets/index.html). It is served from an https origin by
// WebViewAssetLoader so browser storage (saves) and fetch (optional live chat) behave as on the web.
public class MainActivity extends AppCompatActivity {
    private static final String HOME = "https://appassets.androidplatform.net/assets/index.html";
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);
        web.setBackgroundColor(0xFF2B2F66);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                // Any outside link opens in the phone's browser, never inside the game.
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
        });
        setContentView(web);
        if (state != null) web.restoreState(state); else web.loadUrl(HOME);

        // Back closes an open sheet in the game first; otherwise the app goes to the background (progress is saved).
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                web.evaluateJavascript("(window.pmBack&&window.pmBack())?'1':'0'", r -> {
                    if (r == null || !r.contains("1")) moveTaskToBack(true);
                });
            }
        });
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() { super.onPause(); web.evaluateJavascript("window.pmPause&&window.pmPause()", null); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}

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
import android.content.Context;
import android.net.ConnectivityManager;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

// The whole game is one self-contained page. The APK bundles a copy (assets/index.html); the app also keeps itself
// up to date: on launch it reads version.json from the game's GitHub Pages site and, on Wi-Fi, downloads a newer
// index.html into its own storage (files/live/), which opens the next time the app starts. Both copies are served
// from the same https origin by WebViewAssetLoader, so browser storage (saves) carries over.
public class MainActivity extends AppCompatActivity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String SITE = "https://ml-chen.github.io/pathmakers-2040/";
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        final File live = new File(getFilesDir(), "live");
        live.mkdirs();
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/live/", new WebViewAssetLoader.InternalStoragePathHandler(this, live))
                .build();
        final long bundled = buildOf(readAsset("version.json"));
        final File liveHtml = new File(live, "index.html"), liveVer = new File(live, "version.json");
        long have = liveHtml.length() > 1000000 ? buildOf(readFile(liveVer)) : 0;
        if (have <= bundled) { liveHtml.delete(); liveVer.delete(); have = 0; }  // a newer APK beats an older download
        final String home = ORIGIN + (have > 0 ? "/live/index.html" : "/assets/index.html");
        checkForUpdate(live, Math.max(bundled, have));
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
        if (state != null) web.restoreState(state); else web.loadUrl(home);

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

    private long buildOf(String json) { try { return new JSONObject(json).getLong("build"); } catch (Exception e) { return 0; } }
    private String readAsset(String name) { try (InputStream in = getAssets().open(name)) { return slurp(in); } catch (Exception e) { return ""; } }
    private String readFile(File f) { try (InputStream in = new java.io.FileInputStream(f)) { return slurp(in); } catch (Exception e) { return ""; } }
    private static String slurp(InputStream in) throws java.io.IOException { ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n; while ((n = in.read(b)) > 0) o.write(b, 0, n); return o.toString("UTF-8"); }

    // Download a newer game page in the background (Wi-Fi or other unmetered networks only); it opens next launch.
    private void checkForUpdate(final File live, final long current) {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null || cm.getActiveNetworkInfo() == null || cm.isActiveNetworkMetered()) return;
        new Thread(() -> {
            try {
                String ver = fetch(SITE + "version.json?t=" + System.currentTimeMillis());
                long build = buildOf(ver); long bytes = new JSONObject(ver).optLong("bytes", 0);
                if (build <= current) return;
                File tmp = new File(live, "index.html.part");
                HttpURLConnection c = (HttpURLConnection) new URL(SITE + "index.html?b=" + build).openConnection();
                c.setConnectTimeout(15000); c.setReadTimeout(60000);
                try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(tmp)) {
                    byte[] buf = new byte[65536]; int n; while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                }
                if (tmp.length() < 1000000 || (bytes > 0 && tmp.length() != bytes)) { tmp.delete(); return; }
                File dst = new File(live, "index.html"); dst.delete();
                if (!tmp.renameTo(dst)) return;
                try (FileOutputStream out = new FileOutputStream(new File(live, "version.json"))) { out.write(ver.getBytes("UTF-8")); }
                runOnUiThread(() -> Toast.makeText(this, "A new version of Pathmakers is ready. It opens next time you start the app.", Toast.LENGTH_LONG).show());
            } catch (Exception e) { /* offline or the site is down: keep playing the current copy */ }
        }).start();
    }
    private static String fetch(String u) throws java.io.IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection(); c.setConnectTimeout(10000); c.setReadTimeout(15000); c.setUseCaches(false);
        try (InputStream in = c.getInputStream()) { return slurp(in); }
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() { super.onPause(); web.evaluateJavascript("window.pmPause&&window.pmPause()", null); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}

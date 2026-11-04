package com.playvault.familyhangman;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The UI is laid out for tablets with large type already (body 19-22 px,
        // buttons 20-28 px). Android's system font-size setting would multiply
        // that again and push menu labels onto two lines, so keep text at 100 %.
        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) webView.getSettings().setTextZoom(100);
        }
    }
}

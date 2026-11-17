package com.anthonia.pods;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PodsWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

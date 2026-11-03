package com.anthonia.planner;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PlannerBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}

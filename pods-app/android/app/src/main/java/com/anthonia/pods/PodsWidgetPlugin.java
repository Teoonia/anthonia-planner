package com.anthonia.pods;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;

/** Lets the Pods web app hand the home-screen widget its latest news. */
@CapacitorPlugin(name = "PodsWidget")
public class PodsWidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        Context c = getContext();
        try {
            JSObject data = call.getData();
            String avatar = data.getString("avatar", "");
            if (avatar != null && avatar.startsWith("data:image/png;base64,")) {
                byte[] png = Base64.decode(avatar.substring(22), Base64.DEFAULT);
                try (FileOutputStream out = new FileOutputStream(new File(c.getFilesDir(), "widget_avatar.png"))) { out.write(png); }
                data.remove("avatar");
            }
            SharedPreferences p = c.getSharedPreferences("pods_widget", Context.MODE_PRIVATE);
            p.edit().putString("data", data.toString()).apply();
            PodsWidget.refreshAll(c);
            call.resolve();
        } catch (Exception e) {
            call.reject("Couldn't update the widget: " + e.getMessage());
        }
    }
}

package com.anthonia.pods;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
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
@CapacitorPlugin(
        name = "PodsWidget",
        permissions = { @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS}) }
)
public class PodsWidgetPlugin extends Plugin {

    /** Shows a dot / number on the Pods icon by keeping one quiet notification while things are waiting. */
    @PluginMethod
    public void setBadge(PluginCall call) {
        int n = call.getInt("count", 0);
        if (n > 0 && Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            if (!getContext().getSharedPreferences("pods_widget", Context.MODE_PRIVATE).getBoolean("asked", false)) {
                getContext().getSharedPreferences("pods_widget", Context.MODE_PRIVATE).edit().putBoolean("asked", true).apply();
                requestPermissionForAlias("notifications", call, "afterPermission");
                return;
            }
        }
        show(n);
        call.resolve();
    }

    @PermissionCallback
    private void afterPermission(PluginCall call) { show(call.getInt("count", 0)); call.resolve(); }

    private void show(int n) {
        Context c = getContext();
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        if (n <= 0) { nm.cancel(42); return; }
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel("pods_waiting", "Waiting for you", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(true); ch.setDescription("Unread messages and games where it's your turn");
            ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(ch);
        }
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 3, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, "pods_waiting")
                .setSmallIcon(R.drawable.ic_stat_heart)
                .setContentTitle("Pods")
                .setContentText(n == 1 ? "1 thing is waiting for you" : n + " things are waiting for you")
                .setNumber(n).setOnlyAlertOnce(true).setSilent(true).setAutoCancel(true)
                .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL).setContentIntent(pi);
        try { nm.notify(42, b.build()); } catch (SecurityException ignored) { }
    }

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

package com.anthonia.planner;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/** What the web part of the app can ask the phone to do. */
@CapacitorPlugin(
        name = "PlannerBridge",
        permissions = {
                @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
        }
)
public class PlannerBridgePlugin extends Plugin {

    @PluginMethod
    public void scheduleDay(PluginCall call) {
        JSArray items = call.getArray("items", new JSArray());
        try {
            Planner.saveAndSchedule(getContext(), items.toString());
            call.resolve();
        } catch (Exception e) {
            call.reject("Couldn't schedule alerts: " + e.getMessage());
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        Context c = getContext();
        JSObject r = new JSObject();
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
        r.put("notifications", nm != null && nm.areNotificationsEnabled() && Planner.canPost(c));
        r.put("fullScreen", Build.VERSION.SDK_INT < 34 || (nm != null && nm.canUseFullScreenIntent()));
        r.put("overlay", Settings.canDrawOverlays(c));
        r.put("exact", Build.VERSION.SDK_INT < 31 || (am != null && am.canScheduleExactAlarms()));
        r.put("battery", pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName()));
        call.resolve(r);
    }

    @PluginMethod
    public void requestNotifications(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED) {
            call.resolve();
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationsCallback");
    }

    @PermissionCallback
    private void notificationsCallback(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Context c = getContext();
        String which = call.getString("which", "app");
        Uri pkg = Uri.parse("package:" + c.getPackageName());
        Intent i;
        switch (which) {
            case "fullScreen":
                i = Build.VERSION.SDK_INT >= 34
                        ? new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, pkg)
                        : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkg);
                break;
            case "overlay":
                i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, pkg);
                break;
            case "exact":
                i = Build.VERSION.SDK_INT >= 31
                        ? new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, pkg)
                        : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkg);
                break;
            case "battery":
                i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, pkg);
                break;
            default:
                i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkg);
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            c.startActivity(i);
        } catch (Exception e) {
            Intent f = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkg).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(f);
        }
        call.resolve();
    }

    @PluginMethod
    public void testAlert(PluginCall call) {
        Planner.fire(getContext(), -1);
        call.resolve();
    }
}

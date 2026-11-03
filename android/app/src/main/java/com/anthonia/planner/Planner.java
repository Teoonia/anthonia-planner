package com.anthonia.planner;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Everything the phone does on its own, without the app being open:
 * keeps today's + tomorrow's blocks, sets an exact alarm for each start,
 * shows the full-screen alert, keeps the "Now / Next" notification pinned,
 * and feeds the home-screen widget.
 */
public final class Planner {
    static final String PREFS = "planner";
    static final String CH_ALERT = "block_alerts_v1";
    static final String CH_NOW = "now_next_v1";
    static final int NOTIF_ALERT = 1001;
    static final int NOTIF_NOW = 1002;
    static final String ACTION_START = "com.anthonia.planner.BLOCK_START";
    static final String ACTION_END = "com.anthonia.planner.BLOCK_END";
    static final int PURPLE = 0xFF6D3FC0;

    private Planner() {}

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static JSONArray items(Context c) {
        try {
            return new JSONArray(prefs(c).getString("items", "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    static void saveAndSchedule(Context c, String json) {
        prefs(c).edit().putString("items", json).apply();
        schedule(c);
        updateOngoing(c);
        NextTasksWidget.refreshAll(c);
    }

    private static PendingIntent alarmIntent(Context c, String action, int index) {
        Intent i = new Intent(c, BlockAlarmReceiver.class).setAction(action).putExtra("index", index);
        int code = (ACTION_END.equals(action) ? 50000 : 0) + index;
        return PendingIntent.getBroadcast(c, code, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        int prev = prefs(c).getInt("scheduled", 0);
        for (int i = 0; i < prev; i++) {
            am.cancel(alarmIntent(c, ACTION_START, i));
            am.cancel(alarmIntent(c, ACTION_END, i));
        }
        JSONArray arr = items(c);
        long now = System.currentTimeMillis();
        boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o == null) continue;
            long start = o.optLong("start"), end = o.optLong("end");
            if (start > now) set(am, exact, start, alarmIntent(c, ACTION_START, i));
            if (end > now) set(am, exact, end, alarmIntent(c, ACTION_END, i));
        }
        prefs(c).edit().putInt("scheduled", arr.length()).apply();
    }

    private static void set(AlarmManager am, boolean exact, long at, PendingIntent pi) {
        try {
            if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    static String hm(long ms) {
        return new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date(ms));
    }

    static JSONObject current(JSONArray arr, long now) {
        JSONObject cur = null;
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optLong("start") <= now && o.optLong("end") > now) cur = o;
        }
        return cur;
    }

    static List<JSONObject> upcoming(JSONArray arr, long now, int n) {
        List<JSONObject> out = new ArrayList<>();
        for (int i = 0; i < arr.length() && out.size() < n; i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optLong("start") > now) out.add(o);
        }
        return out;
    }

    static String nextLines(List<JSONObject> list) {
        StringBuilder sb = new StringBuilder();
        for (JSONObject o : list) {
            if (sb.length() > 0) sb.append("\n");
            sb.append(hm(o.optLong("start"))).append("  ").append(o.optString("title"));
        }
        return sb.toString();
    }

    static boolean canPost(Context c) {
        return Build.VERSION.SDK_INT < 33
                || c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    static void ensureChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (nm.getNotificationChannel(CH_ALERT) == null) {
            NotificationChannel a = new NotificationChannel(CH_ALERT, "Block alerts", NotificationManager.IMPORTANCE_HIGH);
            a.setDescription("Full-screen alert when a new block starts");
            a.enableVibration(true);
            a.setVibrationPattern(new long[]{0, 300, 150, 300});
            a.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(a);
        }
        if (nm.getNotificationChannel(CH_NOW) == null) {
            NotificationChannel n = new NotificationChannel(CH_NOW, "Now and next", NotificationManager.IMPORTANCE_LOW);
            n.setDescription("Pinned reminder of what's on now and next");
            n.setShowBadge(false);
            nm.createNotificationChannel(n);
        }
    }

    private static PendingIntent openApp(Context c, int code) {
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, code, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** A block is starting: full-screen alert + refresh the pinned note and widget. index -1 = test. */
    static void fire(Context c, int index) {
        JSONArray arr = items(c);
        long now = System.currentTimeMillis();
        JSONObject cur = index >= 0 ? arr.optJSONObject(index) : null;
        boolean test = false;
        if (cur == null) {
            cur = current(arr, now);
            if (cur == null) {
                List<JSONObject> nx = upcoming(arr, now, 1);
                cur = nx.isEmpty() ? null : nx.get(0);
            }
        }
        if (cur == null) {
            test = true;
            cur = new JSONObject();
            try {
                cur.put("title", "This is how your alerts will look");
                cur.put("start", now);
                cur.put("end", now + 30 * 60000L);
            } catch (JSONException ignored) { }
        }
        String title = cur.optString("title");
        String time = hm(cur.optLong("start")) + " – " + hm(cur.optLong("end"));
        String meta = cur.optString("meta", "");
        String next = nextLines(upcoming(arr, Math.max(now, cur.optLong("start")), 3));

        ensureChannels(c);
        Intent full = new Intent(c, AlertActivity.class)
                .putExtra("title", title).putExtra("time", time)
                .putExtra("meta", meta).putExtra("next", next).putExtra("test", test)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent fullPi = PendingIntent.getActivity(c, 7, full,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH_ALERT)
                .setSmallIcon(R.drawable.ic_stat_planner)
                .setColor(PURPLE)
                .setContentTitle(title)
                .setContentText(time)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(
                        time + (meta.isEmpty() ? "" : "\n" + meta) + (next.isEmpty() ? "" : "\n\nUp next:\n" + next)))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setContentIntent(fullPi)
                .setFullScreenIntent(fullPi, true);
        try {
            if (canPost(c)) NotificationManagerCompat.from(c).notify(NOTIF_ALERT, b.build());
        } catch (SecurityException ignored) { }

        // With "Appear on top" allowed, cover the screen even while the phone is in use
        if (Settings.canDrawOverlays(c)) {
            try { c.startActivity(full); } catch (Exception ignored) { }
        }
        updateOngoing(c);
        NextTasksWidget.refreshAll(c);
    }

    /** The pinned "Now / Next" notification that stays after the alert is closed.
     *  Returns null when there's nothing left today (unless the floating ball needs it). */
    static android.app.Notification buildOngoing(Context c, boolean always) {
        ensureChannels(c);
        JSONArray arr = items(c);
        long now = System.currentTimeMillis();
        JSONObject cur = current(arr, now);
        List<JSONObject> nx = upcoming(arr, now, 3);
        String title, body, shortText;
        if (cur == null && nx.isEmpty()) {
            if (!always) return null;
            title = "All done for today";
            body = "Your floating reminder is on";
            shortText = body;
        } else {
            List<JSONObject> rest;
            if (cur != null) {
                title = "Now: " + cur.optString("title") + " · until " + hm(cur.optLong("end"));
                rest = nx;
            } else {
                title = "Next " + hm(nx.get(0).optLong("start")) + ": " + nx.get(0).optString("title");
                rest = nx.subList(1, nx.size());
            }
            String lines = nextLines(rest);
            body = lines.isEmpty() ? "Last one for today" : "Then:\n" + lines;
            shortText = lines.isEmpty() ? "Last one for today" : "Then " + lines.split("\n")[0];
        }
        return new NotificationCompat.Builder(c, CH_NOW)
                .setSmallIcon(R.drawable.ic_stat_planner)
                .setColor(PURPLE)
                .setContentTitle(title)
                .setContentText(shortText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setShowWhen(false)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setContentIntent(openApp(c, 8))
                .build();
    }

    static void updateOngoing(Context c) {
        boolean bubble = BubbleService.isEnabled(c);
        android.app.Notification n = buildOngoing(c, bubble);
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        try {
            if (n == null) nm.cancel(NOTIF_NOW);
            else if (canPost(c)) nm.notify(NOTIF_NOW, n);
        } catch (SecurityException ignored) { }
        BubbleService.refresh(c);
    }
}

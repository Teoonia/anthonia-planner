package com.anthonia.pods;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.File;
import java.util.Calendar;

/** Home-screen widget: your partner's face, the visit countdown, their mood, last message and whose turn it is. */
public class PodsWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle newOptions) {
        update(context, manager, id);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        if (m == null) return;
        int[] ids = m.getAppWidgetIds(new ComponentName(c, PodsWidget.class));
        for (int id : ids) update(c, m, id);
    }

    /** Whole days from today (phone's own calendar) to a yyyy-mm-dd date. */
    static long daysUntil(String ymd) {
        String[] p = ymd.split("-");
        Calendar t = Calendar.getInstance();
        Calendar a = Calendar.getInstance(); a.clear(); a.set(t.get(Calendar.YEAR), t.get(Calendar.MONTH), t.get(Calendar.DAY_OF_MONTH), 12, 0);
        Calendar b = Calendar.getInstance(); b.clear(); b.set(Integer.parseInt(p[0]), Integer.parseInt(p[1]) - 1, Integer.parseInt(p[2]), 12, 0);
        return Math.round((b.getTimeInMillis() - a.getTimeInMillis()) / 86400000.0);
    }

    static void update(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_pods);
        JSONObject d;
        try { d = new JSONObject(c.getSharedPreferences("pods_widget", Context.MODE_PRIVATE).getString("data", "{}")); }
        catch (Exception e) { d = new JSONObject(); }

        String name = d.optString("name", "");
        v.setTextViewText(R.id.pw_name, name.isEmpty() ? "Pods" : name);
        String mood = d.optString("mood", "");
        v.setTextViewText(R.id.pw_mood, mood.isEmpty() ? "" : "feeling " + mood);
        v.setViewVisibility(R.id.pw_mood, mood.isEmpty() ? View.GONE : View.VISIBLE);

        String visit = d.optString("nextVisit", "");
        String count = "Open Pods to set your next visit";
        if (!visit.isEmpty()) {
            try {
                long days = daysUntil(visit);
                count = days > 1 ? days + " days until you're together" : days == 1 ? "Together tomorrow!" : days == 0 ? "Together today!" : "Set your next visit";
            } catch (Exception ignored) { }
        }
        v.setTextViewText(R.id.pw_count, count);

        String msg = d.optString("lastMsg", "");
        v.setTextViewText(R.id.pw_msg, msg);
        v.setViewVisibility(R.id.pw_msg, msg.isEmpty() ? View.GONE : View.VISIBLE);

        String turns = d.optString("turns", "");
        v.setTextViewText(R.id.pw_turns, turns.isEmpty() ? "" : "Your turn: " + turns);
        v.setViewVisibility(R.id.pw_turns, turns.isEmpty() ? View.GONE : View.VISIBLE);

        int h = m.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 110);
        if (h < 90) { v.setViewVisibility(R.id.pw_msg, View.GONE); v.setViewVisibility(R.id.pw_turns, View.GONE); }

        File f = new File(c.getFilesDir(), "widget_avatar.png");
        if (f.exists()) {
            Bitmap b = BitmapFactory.decodeFile(f.getAbsolutePath());
            if (b != null) v.setImageViewBitmap(R.id.pw_avatar, b);
        }
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.pw_root, PendingIntent.getActivity(c, 7, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        m.updateAppWidget(id, v);
    }
}

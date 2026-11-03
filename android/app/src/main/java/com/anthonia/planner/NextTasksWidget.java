package com.anthonia.planner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/** Home-screen widget: what's on now and the next 3 blocks. */
public class NextTasksWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        if (m == null) return;
        int[] ids = m.getAppWidgetIds(new ComponentName(c, NextTasksWidget.class));
        for (int id : ids) update(c, m, id);
    }

    static void update(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_next);
        JSONArray arr = Planner.items(c);
        long now = System.currentTimeMillis();
        JSONObject cur = Planner.current(arr, now);
        List<JSONObject> nx = Planner.upcoming(arr, now, 3);

        v.setTextViewText(R.id.w_now, cur != null
                ? "Now · " + cur.optString("title")
                : "Nothing on right now");
        int[] rows = {R.id.w_1, R.id.w_2, R.id.w_3};
        for (int k = 0; k < rows.length; k++) {
            if (k < nx.size()) {
                JSONObject o = nx.get(k);
                v.setTextViewText(rows[k], Planner.hm(o.optLong("start")) + "   " + o.optString("title"));
                v.setViewVisibility(rows[k], View.VISIBLE);
            } else {
                v.setViewVisibility(rows[k], View.GONE);
            }
        }
        if (nx.isEmpty()) {
            v.setTextViewText(R.id.w_1, "All done for today ✓");
            v.setViewVisibility(R.id.w_1, View.VISIBLE);
        }
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(c, 9, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        m.updateAppWidget(id, v);
    }
}

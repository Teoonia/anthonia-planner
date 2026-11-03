package com.anthonia.planner;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.core.app.NotificationManagerCompat;

/** The full-screen "Starting now" page. Closing it leaves the pinned Now/Next note. */
public class AlertActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Planner.PURPLE);
        getWindow().setNavigationBarColor(Planner.PURPLE);
        show(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        show(intent);
    }

    private int dp(int v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setLineSpacing(0, 1.15f);
        return t;
    }

    private void show(Intent in) {
        boolean test = in.getBooleanExtra("test", false);
        String title = in.getStringExtra("title");
        String time = in.getStringExtra("time");
        String meta = in.getStringExtra("meta");
        String next = in.getStringExtra("next");

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_VERTICAL);
        col.setPadding(dp(28), dp(48), dp(28), dp(48));
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{0xFF6D3FC0, 0xFF8A47C6, 0xFF9B4FC9});
        col.setBackground(bg);

        int amber = 0xFFF2B654, white = Color.WHITE, soft = 0xDDFFFFFF;
        TextView eyebrow = text(test ? "TEST ALERT" : "STARTING NOW", 13, amber, true);
        eyebrow.setLetterSpacing(0.12f);
        col.addView(eyebrow);

        TextView t = text(title == null ? "" : title, 34, white, true);
        t.setPadding(0, dp(10), 0, dp(8));
        col.addView(t);

        col.addView(text(time == null ? "" : time, 18, soft, false));
        if (meta != null && !meta.isEmpty()) {
            TextView m = text(meta, 15, soft, false);
            m.setPadding(0, dp(8), 0, 0);
            col.addView(m);
        }
        if (next != null && !next.isEmpty()) {
            TextView h = text("UP NEXT", 13, amber, true);
            h.setLetterSpacing(0.12f);
            h.setPadding(0, dp(28), 0, dp(6));
            col.addView(h);
            col.addView(text(next, 17, white, false));
        }

        Button ok = new Button(this);
        ok.setText("Got it, let's go");
        ok.setAllCaps(false);
        ok.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        ok.setTypeface(Typeface.DEFAULT_BOLD);
        ok.setTextColor(Planner.PURPLE);
        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(white);
        btnBg.setCornerRadius(dp(14));
        ok.setBackground(btnBg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(56));
        lp.topMargin = dp(36);
        ok.setLayoutParams(lp);
        ok.setOnClickListener((View v) -> {
            NotificationManagerCompat.from(this).cancel(Planner.NOTIF_ALERT);
            Planner.updateOngoing(this);
            finish();
        });
        col.addView(ok);

        ScrollView sv = new ScrollView(this);
        sv.setFillViewport(true);
        sv.setBackground(bg);
        sv.addView(col, new ScrollView.LayoutParams(
                ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.MATCH_PARENT));
        setContentView(sv);
    }
}

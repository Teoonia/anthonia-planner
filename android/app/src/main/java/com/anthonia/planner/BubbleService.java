package com.anthonia.planner;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/**
 * The floating "Mini Mi" ball that sits on top of other apps.
 * Tap it to see what's on now and next; drag it anywhere; it snaps to the side.
 */
public class BubbleService extends Service {
    static final String ACTION_REFRESH = "com.anthonia.planner.BUBBLE_REFRESH";
    private static boolean running = false;

    private WindowManager wm;
    private LinearLayout root;
    private TextView ball, nowText, nextText;
    private LinearLayout card;
    private WindowManager.LayoutParams lp;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
        @Override public void run() { render(); handler.postDelayed(this, 30_000); }
    };

    /* ---------- control from the rest of the app ---------- */
    static boolean isEnabled(Context c) {
        return Planner.prefs(c).getBoolean("bubble", false);
    }

    static void setEnabled(Context c, boolean on) {
        Planner.prefs(c).edit().putBoolean("bubble", on).apply();
        if (on) start(c); else c.stopService(new Intent(c, BubbleService.class));
    }

    static void start(Context c) {
        if (!isEnabled(c) || !Settings.canDrawOverlays(c)) return;
        Intent i = new Intent(c, BubbleService.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignored) { }
    }

    static void refresh(Context c) {
        if (!running) { start(c); return; }
        try { c.startService(new Intent(c, BubbleService.class).setAction(ACTION_REFRESH)); } catch (Exception ignored) { }
    }

    /* ---------- service ---------- */
    @Override public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        goForeground();
        running = true;
        if (!Settings.canDrawOverlays(this)) { stopSelf(); return; }
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        build();
        handler.post(tick);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        goForeground();
        if (!isEnabled(this)) { stopSelf(); return START_NOT_STICKY; }
        render();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        handler.removeCallbacks(tick);
        if (wm != null && root != null) {
            try { wm.removeView(root); } catch (Exception ignored) { }
        }
        super.onDestroy();
    }

    private void goForeground() {
        Notification n = Planner.buildOngoing(this, true);
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(Planner.NOTIF_NOW, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(Planner.NOTIF_NOW, n);
        }
    }

    private int dp(int v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private void build() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        ball = new TextView(this);
        ball.setText("M");
        ball.setGravity(Gravity.CENTER);
        ball.setTextColor(Color.WHITE);
        ball.setTypeface(Typeface.DEFAULT_BOLD);
        ball.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
        GradientDrawable g = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{0xFF6D3FC0, 0xFF9B4FC9, 0xFFD9822B});
        g.setShape(GradientDrawable.OVAL);
        g.setStroke(dp(2), 0xFFFFFFFF);
        ball.setBackground(g);
        ball.setElevation(dp(6));
        root.addView(ball, new LinearLayout.LayoutParams(dp(58), dp(58)));

        card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(16), dp(14), dp(16), dp(14));
        GradientDrawable cg = new GradientDrawable();
        cg.setColor(0xF21D1729);
        cg.setCornerRadius(dp(18));
        cg.setStroke(dp(1), 0xFF6D3FC0);
        card.setBackground(cg);
        card.setElevation(dp(8));

        TextView h1 = label("NOW");
        nowText = body(17, true);
        TextView h2 = label("UP NEXT");
        h2.setPadding(0, dp(10), 0, dp(2));
        nextText = body(14, false);
        card.addView(h1);
        card.addView(nowText);
        card.addView(h2);
        card.addView(nextText);

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, dp(12), 0, 0);
        TextView open = pill("Open planner", true);
        open.setOnClickListener(v -> {
            Intent i = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(i);
            card.setVisibility(View.GONE);
            update();
        });
        TextView close = pill("Close", false);
        close.setOnClickListener(v -> { card.setVisibility(View.GONE); update(); });
        row.addView(open);
        LinearLayout.LayoutParams gap = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        gap.leftMargin = dp(8);
        row.addView(close, gap);
        card.addView(row);
        card.setVisibility(View.GONE);
        LinearLayout.LayoutParams cardLp = new LinearLayout.LayoutParams(dp(270), LinearLayout.LayoutParams.WRAP_CONTENT);
        cardLp.topMargin = dp(8);
        root.addView(card, cardLp);

        int type = Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        lp = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
                type, WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        lp.x = Planner.prefs(this).getInt("bubbleX", dp(8));
        lp.y = Planner.prefs(this).getInt("bubbleY", dp(220));

        ball.setOnTouchListener(new View.OnTouchListener() {
            int startX, startY; float downX, downY; boolean moved;
            @Override public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        startX = lp.x; startY = lp.y; downX = e.getRawX(); downY = e.getRawY(); moved = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (e.getRawX() - downX), dy = (int) (e.getRawY() - downY);
                        if (Math.abs(dx) > dp(6) || Math.abs(dy) > dp(6)) moved = true;
                        if (moved) { lp.x = startX + dx; lp.y = Math.max(0, startY + dy); update(); }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!moved) {
                            render();
                            card.setVisibility(card.getVisibility() == View.VISIBLE ? View.GONE : View.VISIBLE);
                        } else {
                            int w = getResources().getDisplayMetrics().widthPixels;
                            lp.x = (e.getRawX() < w / 2f) ? dp(8) : w - dp(66);
                            Planner.prefs(BubbleService.this).edit().putInt("bubbleX", lp.x).putInt("bubbleY", lp.y).apply();
                        }
                        update();
                        return true;
                }
                return false;
            }
        });

        try { wm.addView(root, lp); } catch (Exception e) { stopSelf(); return; }
        render();
    }

    private void update() {
        if (wm == null || root == null) return;
        // keep the open card on screen when the ball sits on the right edge
        int w = getResources().getDisplayMetrics().widthPixels;
        WindowManager.LayoutParams p = lp;
        if (card.getVisibility() == View.VISIBLE && p.x > w / 2) {
            root.setGravity(Gravity.END);
        } else {
            root.setGravity(Gravity.START);
        }
        try { wm.updateViewLayout(root, p); } catch (Exception ignored) { }
    }

    private void render() {
        if (nowText == null) return;
        JSONArray arr = Planner.items(this);
        long now = System.currentTimeMillis();
        JSONObject cur = Planner.current(arr, now);
        List<JSONObject> nx = Planner.upcoming(arr, now, 3);
        nowText.setText(cur != null
                ? cur.optString("title") + "\nuntil " + Planner.hm(cur.optLong("end"))
                : "Nothing on right now");
        String lines = Planner.nextLines(nx);
        nextText.setText(lines.isEmpty() ? "All done for today ✓" : lines);
    }

    private TextView label(String s) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextColor(0xFFF2B654);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setLetterSpacing(0.12f);
        return t;
    }

    private TextView body(int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setTextColor(Color.WHITE);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setLineSpacing(0, 1.15f);
        return t;
    }

    private TextView pill(String s, boolean primary) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setPadding(dp(14), dp(8), dp(14), dp(8));
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(20));
        if (primary) { g.setColor(0xFFB892FF); t.setTextColor(0xFF1D1729); }
        else { g.setColor(0x00000000); g.setStroke(dp(1), 0x66FFFFFF); t.setTextColor(Color.WHITE); }
        t.setBackground(g);
        return t;
    }
}

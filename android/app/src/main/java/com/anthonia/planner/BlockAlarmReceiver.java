package com.anthonia.planner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Wakes up at the start and end of each block. */
public class BlockAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Planner.ACTION_START.equals(action)) {
            Planner.fire(context, intent.getIntExtra("index", -1));
        } else {
            Planner.updateOngoing(context);
            NextTasksWidget.refreshAll(context);
        }
    }
}

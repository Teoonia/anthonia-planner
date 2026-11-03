package com.anthonia.planner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Alarms are wiped when the phone restarts or the app updates; this puts them back. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Planner.schedule(context);
        Planner.updateOngoing(context);
        NextTasksWidget.refreshAll(context);
        BubbleService.start(context);
    }
}

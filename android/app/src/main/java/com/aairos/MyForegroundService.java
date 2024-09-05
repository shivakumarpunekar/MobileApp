
// MyForegroundService.java
public class MyForegroundService extends Service {
    @Override
    public void onCreate() {
        super.onCreate();
        // Set up your notification channel
        NotificationChannel channel = new NotificationChannel(
            "my_channel_id",
            "My Channel",
            NotificationManager.IMPORTANCE_LOW
        );
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);

        Notification notification = new NotificationCompat.Builder(this, "my_channel_id")
            .setContentTitle("Service Running")
            .setContentText("Foreground service is running")
            .setSmallIcon(R.drawable.ic_notification)
            .build();

        startForeground(1, notification);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Your task code here
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

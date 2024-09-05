const backgroundTask = async () => {
    console.log('Background task running');
    try {
        console.log('Background task running');
        PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: 'Background Notification',
            message: 'This notification is from the background task!',
            playSound: true,
            soundName: 'default',
            priority: 'high',
        });
        console.log('Local notification triggered');
    } catch (error) {
        console.error('Error in background task:', error);
    }
    console.log('Local notification triggered');
};

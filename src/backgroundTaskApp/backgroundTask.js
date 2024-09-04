import PushNotification from 'react-native-push-notification';

const backgroundTask = async () => {
    try {
        console.log('Background task running');

        // Example background task: Trigger a local notification
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
};

export default backgroundTask;

import PushNotification from 'react-native-push-notification';

const backgroundTask = async () => {
    try {
        // Perform the background operation, e.g., fetching data or updating local storage
        console.log('Background task running');

        // Here we simulate a background task that triggers a local notification
        PushNotification.localNotification({
            channelId: 'default-channel-id', // Make sure this matches your channel ID
            title: 'Background Notification',
            message: 'This is a notification from the background task!',
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

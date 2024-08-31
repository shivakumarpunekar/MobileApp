// src/NotificationService/backgroundNotificationHandler.js
import PushNotification from 'react-native-push-notification';

module.exports = async (taskData) => {
    const { title, message } = taskData.data; // Ensure taskData.data is used if coming from FCM

    // Log for debugging
    console.log('Running background notification handler', taskData);

    // Show the local notification
    PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: title || 'Background Notification',
        message: message || 'You have received a new notification.',
        importance: 'high',
        priority: 'high',
        soundName: 'default',
        playSound: true,
        vibrate: true,
        showWhen: true,
        when: Date.now(),
    });
};

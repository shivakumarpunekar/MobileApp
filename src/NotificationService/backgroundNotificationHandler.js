const backgroundNotificationHandler = async (taskData) => {
    console.log('Headless Task Invoked', taskData);

    try {
        const response = await fetch('http://103.145.50.185:2030/api/sensor_data/top100perdevice');
        const data = await response.json();
        console.log('Fetched Data:', data);

        data.forEach((device) => {
            const { deviceId, solenoidValveStatus, createdDateTime } = device;

            const currentDate = moment().format('DD-MM-YYYY');
            const formattedCreatedDateTime = moment(createdDateTime, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');

            // Load previous state from storage or a database
            const previousState = getPreviousState(deviceId); // Implement this

            const heartIconColor = formattedCreatedDateTime === currentDate ? '#00FF00' : '#FF0000';
            const valveIconColor = solenoidValveStatus === 'On' ? '#00FF00' : '#FF0000';

            if (previousState) {
                if (heartIconColor !== previousState.heartIconColor || valveIconColor !== previousState.valveIconColor) {
                    PushNotification.localNotification({
                        channelId: 'default-channel-id',
                        title: 'Device Status Changed',
                        message: `Device ${deviceId} status changed: Heart Icon ${heartIconColor === '#FF0000' ? 'Red' : 'Green'}, Valve Icon ${valveIconColor === '#FF0000' ? 'Red' : 'Green'}`,
                        playSound: true,
                        soundName: 'default',
                        priority: 'high',
                    });
                }
            }

            // Save the current state
            saveCurrentState(deviceId, { heartIconColor, valveIconColor }); // Implement this
        });
    } catch (error) {
        console.error('Error fetching data in background', error);
    }
};

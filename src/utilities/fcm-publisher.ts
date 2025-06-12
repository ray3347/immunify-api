const axios = require('axios')

export const pushNotification = async (title: string, body: string, token: string) => {
 const message = {
    to: `${token}`,
    sound: 'default',
    title: title,
    body: body,
  };

  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
  });

  console.log('Notification for', token);
}
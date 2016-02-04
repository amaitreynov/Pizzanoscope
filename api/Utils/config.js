/**
 * Created by Antoine on 16/11/2015.
 */
module.exports = {

    'secret': 'ilovesaltynodejs',
    'database': {
        server: 'localhost',
        db: 'express-jwt-auth'

    },
    'log4js': {
        'appenders': [
            {
                'type': 'dateFile',
                'filename': './logs/server.log',
                'pattern': '-yyyy-MM-dd'
            },
            {
                'type': 'console'
            }
        ],
        'replaceConsole': true,
        'levels': {
            '[all]': 'DEBUG',
            'server.logger': 'DEBUG',
            'server.core': 'DEBUG'
        }
    },
    'XOAuth2': {
        'user': "labodevtest@gmail.com", // Your gmail address.// Not @developer.gserviceaccount.com
        'clientId': " 865649978609-2rsbrjkj8j56o839rp7cd561e27nen5i.apps.googleusercontent.com",
        'clientSecret': " MgWRF6VcUUCDQkwty_5_X489",
        'refreshToken': "1/OVpUWLHSdRdJAkatEUf8LuarThmMEKfqZFU4UQQmfMlIgOrJDtdun6zK6XiATCKT"
    },
    'smtp':{
        sender:'labodevtest@gmail.com',
    }
};
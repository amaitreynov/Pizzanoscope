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
    'smtp':{
        'sender':'labodevtest@gmail.com',
        'mailgun':{
            'apiKey': 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
            'domain': 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
        }
    }
};
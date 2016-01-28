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
    }
};
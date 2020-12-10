const AWS = require('aws-sdk');

AWS.config.update({
    region: 'ap-south-1',
    signatureVersion: 'v4'
});

module.exports.get = async (event, context, callback) => {
    try {
        // Mandatory in every function to check for Authorization
        if (!event.requestContext.authorizer) {
            errorResponse(401, 'Authorization not configured', context.awsRequestId, callback);
        }
        let response = [];
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const cognitoUsers = await cognito.listUsers({
            UserPoolId: process.env.user_pool
        }).promise();
        cognitoUsers.Users.forEach((cognitoUser) => {
            const user = {};
            cognitoUser.Attributes.forEach((attribute) => {
                user[attribute.Name] = attribute.Value;
            });
            user.created = cognitoUser.UserCreateDate;
            user.enabled = cognitoUser.Enabled;
            response.push(user);
        });
        callback(null, {
            body: JSON.stringify(response),
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        errorResponse(500, e.message, context.awsRequestId, callback);
    }
}

module.exports.add = async (event, context, callback) => {
    try {
        // Mandatory in every function to check for Authorization
        if (!event.requestContext.authorizer) {
            errorResponse(401, 'Authorization not configured', context.awsRequestId, callback);
        }
        let UserAttributes = [];
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const body = JSON.parse(event.body);
        Object.keys(body).forEach((key) => {
            if (key === 'role') {
                UserAttributes.push({
                    Name: 'custom:role',
                    Value: body[key].toLowerCase()
                });
            } else {
                UserAttributes.push({
                    Name: key,
                    Value: body[key].toLowerCase()
                });
            }
        });
        let text = "";
        const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < 5; i++) {
            text += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        }
        const possibleSymbols = "!@#*_-";
        text += possibleSymbols.charAt(Math.floor(Math.random() * possibleSymbols.length));
        const possibleNumbers = "0123456789";
        for (let i = 0; i < 5; i++) {
            text += possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length));
        }
        await cognito.adminCreateUser({
            DesiredDeliveryMediums: ["EMAIL"],
            UserPoolId: process.env.user_pool,
            Username: body.email.toLowerCase(),
            TemporaryPassword: text,
            UserAttributes
        }).promise();
        callback(null, {
            body: JSON.stringify(body),
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        errorResponse(500, e.message, context.awsRequestId, callback);
    }
}

errorResponse = (code, errorMessage, awsRequestId, callback) => {
    callback(null, {
        statusCode: code,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

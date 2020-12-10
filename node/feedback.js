const AWS = require('aws-sdk');
const randomBytes = require('crypto').randomBytes;

AWS.config.update({
    region: 'ap-south-1',
    signatureVersion: 'v4'
});

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.add = async (event, context, callback) => {
    try {
        // check for Authorization
        if (!event.requestContext.authorizer) {
            errorResponse(401, 'Authorization not configured', context.awsRequestId, callback);
        }
        const body = JSON.parse(event.body);
        const feedbackId = toUrlString(randomBytes(16));
        await ddb.put({
            TableName: 'Feedbacks',
            Item: {
                FeedbackId: feedbackId,
                question1: body.q1,
                question2: body.q2,
                question3: body.q3,
                question4: body.q4,
                text: body.text,
                created: new Date().toISOString(),
                user: {
                    name: event.requestContext.authorizer.claims['name'],
                    email: event.requestContext.authorizer.claims['email'],
                    sub: event.requestContext.authorizer.claims['sub']
                },
            },
        }).promise();
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({id: feedbackId}),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (e) {
        errorResponse(500, e.message, context.awsRequestId, callback);
    }
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
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

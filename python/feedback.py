import boto3
import json

dynamodb = boto3.client('dynamodb')

def get(event, context):

    if not event['requestContext']['authorizer']:
        return {
            "statusCode": 401,
            "body": json.dumps({'Error': 'Authorization not configured', 'Reference': context['awsRequestId']}),
            "headers": {
                "Access-Control-Allow-Origin": "*"
            }
        }

    user = event['requestContext']['authorizer']['claims']

    if user['custom:role'] != 'admin':
        return {
            "statusCode": 409,
            "body": json.dumps({'Error': '', 'Reference': context['awsRequestId']}),
            "headers": {
                "Access-Control-Allow-Origin": "*"
            }
        }

    feedback = dynamodb.scan(
        TableName='Feedbacks'
    )

    for i in feedback['Items']:
        d = ast.literal_eval((json.dumps(i, cls=DecimalEncoder)))

    return {
        "statusCode": 200,
        "body": json.dumps(feedback['Items']),
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }

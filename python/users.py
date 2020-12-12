import boto3
import json
import os

cognito = boto3.client('cognito-idp')

def disable(event, context):

    if not event['requestContext']['authorizer']:
        return {
            "statusCode": 401,
            "body": json.dumps({'Error': 'Authorization not configured', 'Reference': context['awsRequestId']}),
            "headers": {
                "Access-Control-Allow-Origin": "*"
            }
        }

    cognito.admin_disable_user(
        UserPoolId = os.environ['user_pool'],
        Username = event['pathParameters']['id']
    )

    return {
        "statusCode": 204,
        "body": '',
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }

def enable(event, context):

    if not event['requestContext']['authorizer']:
        return {
            "statusCode": 401,
            "body": json.dumps({'Error': 'Authorization not configured', 'Reference': context['awsRequestId']}),
            "headers": {
                "Access-Control-Allow-Origin": "*"
            }
        }

    cognito.admin_enable_user(
        UserPoolId = os.environ['user_pool'],
        Username = event['pathParameters']['id']
    )

    return {
        "statusCode": 202,
        "body": '',
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }

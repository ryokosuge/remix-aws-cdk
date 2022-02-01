import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2Alpha from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigatewayv2Integration from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; 
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

import * as path from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// @ts-ignore -- implicitly 'any' type.
import * as remixConfig from "../../remix.config";

export class CdkStack extends Stack {

  public readonly function: lambda.Function;
  public readonly apigateway: apigatewayv2Alpha.HttpApi;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.function = new lambda.Function(this, `${id}-lambda`, {
      code: lambda.Code.fromAsset(
          path.join(__dirname, "../../server")
        ),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const integration = new apigatewayv2Integration.HttpLambdaIntegration(`${id}-apigateway-integration`, this.function, {
      payloadFormatVersion: apigatewayv2Alpha.PayloadFormatVersion.VERSION_2_0,
    });

    this.apigateway = new apigatewayv2Alpha.HttpApi(this, `${id}-apigateway`, {
      defaultIntegration: integration,
    });

    const httpApiHost = (this.apigateway.url ?? "").split("/")[2];
    const staticBucket = new s3.Bucket(this, `${id}-static-bucket`); 
    new s3Deployment.BucketDeployment(this, `${id}-static-bucket-deploy`, {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, "../../public")),
      ],
      destinationBucket: staticBucket,
    });

    const cachePolicy = new cloudfront.CachePolicy(this, `${id}-cloudfront-cachePolicy`, {})
    this.distribution = new cloudfront.Distribution(
      this,
      `${id}-cloudfront-distribution`,
      {
        defaultBehavior: {
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy,
          origin: new cloudfrontOrigins.HttpOrigin(httpApiHost),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        additionalBehaviors: {
          [`${remixConfig.publicPath}*`]: {
            origin: new cloudfrontOrigins.S3Origin(staticBucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          }
        }
      },
    );
  }
}

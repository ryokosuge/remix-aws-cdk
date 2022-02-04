import * as path from "path";

import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2Alpha from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigatewayv2Integration from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; 
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

// @ts-ignore -- implicitly 'any' type.
import * as remixConfig from "../../app/remix.config";

export class CdkStack extends Stack {

  public readonly function: lambda.Function;
  public readonly apigateway: apigatewayv2Alpha.HttpApi;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.function = new lambda.Function(this, `${id}-lambda`, {
      code: lambda.Code.fromAsset(
          path.join(__dirname, "../../app/server")
        ),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        "NODE_ENV": "PRODUCTION",
      },
    });

    const integration = new apigatewayv2Integration.HttpLambdaIntegration(`${id}-apigateway-integration`, this.function, {
      payloadFormatVersion: apigatewayv2Alpha.PayloadFormatVersion.VERSION_2_0,
    });

    this.apigateway = new apigatewayv2Alpha.HttpApi(this, `${id}-apigateway`, {
      defaultIntegration: integration,
    });

    const httpApiHost = (this.apigateway.url ?? "").split("/")[2];
    const staticBucket = new s3.Bucket(this, `${id}-static-bucket`, {
      bucketName: "remix-app-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    }); 

    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, "oai");
    [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
        resources: [staticBucket.bucketArn + "/*"],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:ListBucket"],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
        resources: [staticBucket.bucketArn]
      })
    ].forEach(policy => staticBucket.addToResourcePolicy(policy));

    new s3Deployment.BucketDeployment(this, `${id}-static-bucket-deploy`, {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, "../../app/public")),
      ],
      destinationBucket: staticBucket,
    });

    const cachePolicy = new cloudfront.CachePolicy(this, `${id}-cloudfront-apigateway-cachepolicy`, {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.allowList("_data"),
    })
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
            origin: new cloudfrontOrigins.S3Origin(staticBucket, {
              originAccessIdentity: cloudFrontOAI 
            }),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
          ["/res/*"]: {
            origin: new cloudfrontOrigins.S3Origin(staticBucket, {
              originAccessIdentity: cloudFrontOAI 
            }),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          }
        }
      },
    );

    this.function.addEnvironment(
      "ASSET_HOST",
      `https://${this.distribution.domainName}`,
    )
  }
}

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
const stack = new CdkStack(app, 'CdkStack', {});

new cdk.CfnOutput(stack, "api-url", {
  value: stack.apigateway.url ?? "",
});

new cdk.CfnOutput(stack, "cloudfront domain", {
  value: stack.distribution.domainName,
});

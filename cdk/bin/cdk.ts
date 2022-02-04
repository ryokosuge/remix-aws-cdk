#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
const stack = new CdkStack(app, 'remix-app', {});

new cdk.CfnOutput(stack, "APIGateway URL", {
  value: stack.apigateway.url ?? "",
});

new cdk.CfnOutput(stack, "Cloud Front Distribution URL", {
  value: `https://${stack.distribution.domainName}`,
});

import * as cdk from "aws-cdk-lib";

export type StackConfig = {
	readonly remixCookieSecret?: string;
	readonly stackName: string;
};

export type StackProps = cdk.StackProps & {
	config: StackConfig;
};

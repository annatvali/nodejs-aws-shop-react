import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

import { BlockPublicAccess, BucketAccessControl } from "aws-cdk-lib/aws-s3";

import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib";

export class CdkAppStackV2 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to store content and set removal policy to eithrt 'Retain' or 'Destroy'
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: "aws-shop-react-cdk-bucket",
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      websiteIndexDocument: "index.html",
      //  websiteErrorDocument: 'error/index.html',
    });
    new CfnOutput(this, "Bucket", { value: siteBucket.bucketName });

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI", {
      comment:
        "Allow CloudFront to reach the bucket - nodejs-aws-shop-react-bucket",
    });

    // Deploy CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultRootObject: "index.html",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(siteBucket, {
          originAccessIdentity: oai,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // Update S3 bucket policy to allow access from the CloudFront OAI
    siteBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [oai.grantPrincipal],
      })
    );

    // Deploy the nodejs-aws-shop-react app files to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: siteBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
      description: "CloudFront Public URL",
    });

    new CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "CloudFront Distribution ID",
    });

    new CfnOutput(this, "S3", {
      value: siteBucket.bucketName,
      description: "S3 Private Bucket",
    });
  }
}

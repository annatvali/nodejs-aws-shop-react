import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';

import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create an S3 bucket to store content and set removal policy to eithrt 'Retain' or 'Destroy'
     const siteBucket = new s3.Bucket(this, 'SiteBucket', {
       bucketName: 'rsschool-cdk-deployment-bucket',
       publicReadAccess: true,
       removalPolicy: RemovalPolicy.DESTROY,
       autoDeleteObjects: true,
       blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
       accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
       websiteIndexDocument: 'index.html',
      //  websiteErrorDocument: 'error/index.html',
     });
     new CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });


     // Deploy CloudFront distribution

     const distribution = new cloudfront.Distribution(
       this,
       'SiteDistribution',
       {
         defaultRootObject: 'index.html',
         minimumProtocolVersion:
           cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        //  errorResponses: [
        //    {
        //      httpStatus: 404,
        //      responseHttpStatus: 404,
        //      responsePagePath: '/error/index.html',
        //      ttl: Duration.minutes(30),
        //    },
        //  ],
         defaultBehavior: {
           origin: new cloudfront_origins.S3Origin(siteBucket),
           compress: true,
           allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
           viewerProtocolPolicy:
             cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
         },
       }
     );

     new CfnOutput(this, 'DistributionId', {
       value: distribution.distributionId,
     });


     // Deploy the nodejs-aws-shop-react app files to S3 bucket

     new s3deploy.BucketDeployment(this, 'DeployWebsite', {
       sources: [s3deploy.Source.asset('../dist')],
       destinationBucket: siteBucket,
       distribution: distribution,
       distributionPaths: ['/*'],
     });


    // example resource
    // const queue = new sqs.Queue(this, 'CdkAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}

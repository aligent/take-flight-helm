#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import ClusterConstruct from '../lib/takeflight2-poc-stack';

const app = new cdk.App();

const stagingEnv = { 
    account: '182399723872', 
    region: 'ap-southeast-2', 
    environment: 'staging',
    hostedZoneName: 'takeflight2.aligent.cloud',
    repoUrl: '',
    credentialsSecretName: '',
    credentialsType: 'SSH',
    repoPath: '',
    targetRevision: 'production'
};

stagingEnv.repoPath = `helm-repo/environments/${stagingEnv.environment}`;

const staging = new cdk.Stage(app, 'Staging', { env: stagingEnv })
new ClusterConstruct(staging, 'Cluster', { env: stagingEnv });
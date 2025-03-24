#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import ClusterConstruct from '../lib/takeflight2-poc-stack';

const app = new cdk.App();

const stagingEnv = { 
    account: '182399723872', 
    region: 'ap-southeast-2', 
    environment: 'staging',
    hostedZoneName: 'takeflight2.aligent.cloud',
    repoUrl: 'git@bitbucket.org:aligent/takeflight2.git',
    credentialsSecretName: 'tf2-argocd-ssh-key',
    credentialsType: 'SSH' as const,
    repoPath: '', //leave repoPath blank for now as it will be set later
    targetRevision: 'production'
};

// stagingEnv.repoPath = `helm-nextjs/environments/${stagingEnv.environment}`; //repoPath is set here
stagingEnv.repoPath = `helm-nextjs/argo`; //repoPath is set here

const staging = new cdk.Stage(app, 'Staging', { env: stagingEnv })
new ClusterConstruct(staging, 'Cluster', { env: stagingEnv });
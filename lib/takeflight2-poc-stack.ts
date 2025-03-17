import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KubernetesVersion } from 'aws-cdk-lib/aws-eks';

// add environment props
export interface ClusterConstructProps extends cdk.StackProps {
  env: {
    account: string;
    region: string;
    environment: string;
    hostedZoneName: string;
    repoUrl: string;
    credentialsSecretName: string;
    credentialsType: string;
    repoPath: string;
    targetRevision: string;
  };
}

export default class ClusterConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ClusterConstructProps) {
    super(scope, id);

    const account = props.env.account;
    const region = props.env.region;
    const environment = props.env.environment;
    const hostedZoneName = props.env.hostedZoneName;
    const repoUrl = props.env.repoUrl;
    const credentialsSecretName = props.env.credentialsSecretName;
    const credentialsType = props.env.credentialsType;
    const repoPath = props.env.repoPath;
    const targetRevision = props.env.targetRevision;

    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.ArgoCDAddOn({
        bootstrapRepo: {
          repoUrl: repoUrl || '',
          credentialsSecretName: credentialsSecretName,
          credentialsType: credentialsType as "USERNAME" | "TOKEN" | "SSH" | undefined,
          path: repoPath,
          targetRevision: targetRevision,

        },
      }),
      new blueprints.addons.SecretsStoreAddOn(),
      new blueprints.addons.KarpenterAddOn({
        values: {
          replicas: 1,
        },
      }),
      new blueprints.addons.ExternalDnsAddOn({
        hostedZoneResources: hostedZoneName? [hostedZoneName] : [],
      }),

    ];

    const blueprint = blueprints.EksBlueprint.builder()
    .version(KubernetesVersion.V1_31) // Use a valid Kubernetes version from the enum
    .account(account)
    .region(region)
    .addOns(...addOns)
    .resourceProvider(hostedZoneName, new blueprints.LookupHostedZoneProvider(hostedZoneName))
    .build(scope, id+'-stack', props);
  }
}

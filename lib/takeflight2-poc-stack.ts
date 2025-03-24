import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KubernetesVersion } from 'aws-cdk-lib/aws-eks';
import { ArgoCDAddOn } from '@aws-quickstart/eks-blueprints'; 

// add environment props
export interface ClusterConstructProps extends cdk.StackProps {
  env: {
    account: string;
    region: string;
    environment: string;
    hostedZoneName: string;
    repoUrl: string;
    credentialsSecretName: string;
    credentialsType: 'USERNAME' | 'TOKEN' | 'SSH';
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
      new blueprints.addons.KarpenterAddOn({
        values: {
          "replicas": 1,
        }
      }),
      new blueprints.addons.ExternalDnsAddOn({
        hostedZoneResources: hostedZoneName? [hostedZoneName] : [],
      }),
      new blueprints.addons.ExternalDnsAddOn({
        hostedZoneResources: hostedZoneName ? [hostedZoneName] : [],
      }),
      new blueprints.addons.ArgoCDAddOn({
        bootstrapRepo: {
          repoUrl,
          path: repoPath,
          targetRevision,
          credentialsSecretName,
          credentialsType
        },
      }),
    ];

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .version(KubernetesVersion.V1_31) // Use a valid Kubernetes version from the enum
    .addOns(...addOns)
    .resourceProvider(hostedZoneName, new blueprints.LookupHostedZoneProvider(hostedZoneName))
    .build(scope, id+'-stack', props);
  }
}

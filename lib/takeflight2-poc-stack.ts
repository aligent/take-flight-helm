import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KubernetesVersion } from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';


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

    const {
      account,
      region,
      environment,
      hostedZoneName,
      repoUrl,
      credentialsSecretName,
      // credentialsType,
      repoPath,
      targetRevision,
    } = props.env;

    const credentialsType = 'SSH';

    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.ExternalsSecretsAddOn(),
      new blueprints.addons.KarpenterAddOn({
        values: {
          replicas: 1,
        },
      }),
      new blueprints.addons.ExternalDnsAddOn({
        name: `external-dns-${environment}`,
        hostedZoneResources: hostedZoneName? [hostedZoneName] : [],
      }),
      new blueprints.addons.ArgoCDAddOn({
        bootstrapRepo: {
          repoUrl,
          path: repoPath,
          targetRevision,
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

    // After cluster is built, manually add the IRSA for ESO
    const cluster = blueprint.getClusterInfo().cluster;

    const esoSA = cluster.addServiceAccount('ESOServiceAccount', {
      name: 'external-secrets-sa',
      namespace: 'external-secrets',
    });

    esoSA.role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:${credentialsSecretName}*`,
        ],
        effect: iam.Effect.ALLOW,
      })
    );

  }
}

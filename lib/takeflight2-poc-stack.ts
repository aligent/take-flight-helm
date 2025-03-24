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

    const account = props.env.account;
    const region = props.env.region;
    const environment = props.env.environment;
    const hostedZoneName = props.env.hostedZoneName;
    const repoUrl = props.env.repoUrl;
    const credentialsSecretName = props.env.credentialsSecretName;
    const credentialsType = 'SSH';
    const repoPath = props.env.repoPath;
    const targetRevision = props.env.targetRevision;

    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.KarpenterAddOn({
        values: {
          replicas: 1,
        },
      }),
      new blueprints.addons.SecretsStoreAddOn({
        syncSecrets: true,
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
          credentialsSecretName,
          credentialsType,
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

    // 👇 This gives you the ClusterInfo
    const clusterInfo = blueprint.getClusterInfo();

    // ✅ Now use it to add the IRSA-bound service account
    const argoIRSA = clusterInfo.cluster.addServiceAccount('argo-irsa', {
      name: 'argocd-blueprints-addon-argocd-server',
      namespace: 'argocd',
    });

    argoIRSA.role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:tf2-argocd-ssh-key*`,
        ],
      }),
    );

  }
}

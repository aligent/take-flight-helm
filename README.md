# Take Flight Helm Charts

Kubernetes deployment configurations for the Take Flight e-commerce platform using Helm charts and GitOps with ArgoCD.

## Repository Structure

```
.
├── apps/
│   └── takeflight/        # Main Helm chart for Take Flight applications
│       ├── Chart.yaml     # Chart metadata
│       ├── values.yaml    # Production values
│       ├── templates/     # Kubernetes resource templates
│       └── preview/       # Preview environment configurations
└── argocd/                # ArgoCD configurations
    ├── applicationsets/   # ApplicationSets for automated deployments
    │   └── takeflight-appset.yaml  # Preview environment automation
    └── applications/      # ArgoCD Application definitions
        └── takeflight-production.yaml  # Production deployment
```

## Quick Start

### Deploying to Local Cluster

```bash
# Install with production values (default)
helm upgrade --install takeflight ./apps/takeflight

# Install with preview environment values
helm upgrade --install takeflight ./apps/takeflight -f apps/takeflight/preview/store-bigcommerce/values.yaml
```

### Development Workflow

1. **Validate charts**: `helm lint apps/takeflight/`
2. **Test templates**: `helm template takeflight ./apps/takeflight -f apps/takeflight/values.yaml`
3. **Dry run**: `helm template takeflight ./apps/takeflight | kubectl apply --dry-run=client -f -`

## Security Guidelines

### Secrets Management

**CRITICAL**: This repository uses placeholder values for secrets. Do NOT commit real secrets to git.

#### Option 1: Environment Variables (Current)
Update `env` values in your deployment values files with real secrets.

#### Option 2: Kubernetes Secrets (Recommended)
Enable secret management by setting `secrets.create: true` in values files:

```yaml
secrets:
  create: true
  name: "takeflight-secrets"
  nextAuthSecret: "your-actual-secret"
  authSecret: "your-actual-secret"
```

### Certificate Management

- **Production**: Uses certificate ARN `171401ce-1512-40ab-a624-8ad557849a64`
- **Preview**: Uses certificate ARN `30f1ca2f-35f4-44bb-919a-d902569eb0f5`

Certificate ARNs are centralized in the `certificates` section of values files.

## Environment Configuration

### Production (Default)
- **Hostname**: `takeflight.aligent.com`
- **Replicas**: 3
- **Resources**: 500m-1000m CPU, 512Mi-1024Mi memory
- **Secrets**: Kubernetes secrets enabled
- **Values**: Configured directly in `apps/takeflight/values.yaml`

### Preview Environments
- **Auto-generated**: Based on values files in `apps/takeflight/preview/`
- **Stores**: Adobe Commerce, BigCommerce
- **Management**: ArgoCD ApplicationSet in `argocd/applicationsets/`

## GitOps Workflow

### Prerequisites
- ArgoCD installed and configured (via AWS EKS Blueprints)
- ArgoCD has read access to this repository
- Application definitions applied to ArgoCD cluster

### Deployment Flow
1. **Feature Development**: Work on feature branches
2. **Preview**: Update values in `apps/takeflight/preview/` for testing
   - ArgoCD ApplicationSet automatically creates preview applications
3. **Production**: Merge to main triggers ArgoCD sync to production via `argocd/applications/takeflight-production.yaml`

## ArgoCD Integration

### Prerequisites
- **ArgoCD Installation**: ArgoCD must be installed in your EKS cluster (typically via AWS EKS Blueprints or other infrastructure-as-code)
- **Repository Access**: ArgoCD needs read access to this repository

### Application Definitions
This repository contains ArgoCD application definitions (not ArgoCD installation files):

- **Applications**: Defined in `argocd/applications/` for production deployment
- **ApplicationSets**: Defined in `argocd/applicationsets/` for automated preview environments  
- **Purpose**: These files tell ArgoCD **what** to deploy, not **how** to install ArgoCD itself

### Architecture
- **Infrastructure Layer**: ArgoCD platform installed via AWS EKS Blueprints (separate repository)
- **Application Layer**: This repository defines applications for ArgoCD to manage
- **GitOps Pattern**: ArgoCD reads these definitions and automatically deploys/syncs applications

## Troubleshooting

### Common Issues

- **Hardcoded secrets**: Use placeholders, enable Kubernetes secrets
- **Certificate errors**: Verify correct ARN for environment
- **Template errors**: Run `helm lint` and `helm template` before commit
- **ArgoCD not deploying**: Ensure ArgoCD is installed and has access to this repository
- **Application not syncing**: Check ArgoCD UI for sync status and errors

### Health Checks

Health checks are commented out in `deployment.yaml`. Enable for production:

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 10
```

## Contributing

1. Create feature branch: `feature/TF2-XXX_description`
2. Test changes with `helm lint apps/takeflight/` and `helm template`
3. Update production values in `apps/takeflight/values.yaml` or preview values in `apps/takeflight/preview/`
4. Commit with ticket reference: `TF2-XXX: Description`
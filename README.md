# Take Flight Helm Charts

Kubernetes deployment configurations for the Take Flight e-commerce platform using Helm charts and GitOps with ArgoCD.

## Repository Structure

```
.
├── nextjs/                 # Main Helm chart for Next.js applications
│   ├── Chart.yaml         # Chart metadata
│   ├── values.yaml        # Default values
│   ├── templates/         # Kubernetes resource templates
│   └── preview/           # Preview environment configurations
├── environments/          # Environment-specific configurations
│   ├── staging/          # Staging environment
│   └── production/       # Production environment
├── preview-env/          # ArgoCD ApplicationSet for preview environments
└── archive/              # Historical configurations (documented)
```

## Quick Start

### Deploying to Local Cluster

```bash
# Install with default values
helm upgrade --install nextjs ./nextjs

# Install with environment-specific values
helm upgrade --install nextjs ./nextjs -f environments/production/values.yaml

# Install with preview environment values
helm upgrade --install nextjs ./nextjs -f nextjs/preview/store-bigcommerce/values.yaml
```

### Development Workflow

1. **Validate charts**: `helm lint nextjs/`
2. **Test templates**: `helm template nextjs ./nextjs -f nextjs/values.yaml`
3. **Dry run**: `helm template nextjs ./nextjs | kubectl apply --dry-run=client -f -`

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
  name: "nextjs-secrets"
  nextAuthSecret: "your-actual-secret"
  authSecret: "your-actual-secret"
```

### Certificate Management

- **Production**: Uses certificate ARN `171401ce-1512-40ab-a624-8ad557849a64`
- **Preview**: Uses certificate ARN `30f1ca2f-35f4-44bb-919a-d902569eb0f5`

Certificate ARNs are centralized in the `certificates` section of values files.

## Environment Configuration

### Production
- **Hostname**: `takeflight.aligent.com`
- **Replicas**: 3
- **Resources**: 500m-1000m CPU, 512Mi-1024Mi memory
- **Secrets**: Kubernetes secrets enabled

### Staging
- **Deployment**: Managed by ArgoCD from main branch
- **Configuration**: See `environments/staging/`

### Preview Environments
- **Auto-generated**: Based on values files in `nextjs/preview/`
- **Stores**: Adobe Commerce, BigCommerce
- **Management**: ArgoCD ApplicationSet

## GitOps Workflow

1. **Feature Development**: Work on feature branches
2. **Preview**: Update values in `nextjs/preview/` for testing
3. **Staging**: Merge to main triggers ArgoCD sync to staging
4. **Production**: Manual deployment using production values

## Troubleshooting

### Common Issues

- **Hardcoded secrets**: Use placeholders, enable Kubernetes secrets
- **Certificate errors**: Verify correct ARN for environment
- **Template errors**: Run `helm lint` and `helm template` before commit

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
2. Test changes with `helm lint` and `helm template`
3. Update relevant environment values
4. Commit with ticket reference: `TF2-XXX: Description`
# Archive Directory

This directory contains historical configurations that are no longer actively used but preserved for reference.

## Contents

### `argocd/`
Legacy ArgoCD application configurations that were used before the current GitOps setup:
- `argo-ingress.yaml` - Old ArgoCD UI ingress configuration
- `argocd-app.yaml` - Old ArgoCD application definition
- `argocd-deployment.yaml` - Old ArgoCD deployment specification

**Status**: Superseded by current ArgoCD setup in `/environments/staging/argocd/`

### `feature-932233c/`
Feature branch values from a specific development iteration:
- `values.yaml` - Helm values for feature branch deployment (commit 932233c)

**Status**: Historical feature branch, no longer needed for active development

## Maintenance

These files are kept for historical reference and can be safely removed if disk space is needed. They do not affect current deployments or development workflows.
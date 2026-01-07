# GitHub Actions Workflow Troubleshooting

If your GitHub Actions workflow is not running, check the following:

## 1. Verify Workflow File Location

The workflow file must be at:
```
.github/workflows/deploy-ec2.yml
```

Check if it exists:
```bash
ls -la .github/workflows/deploy-ec2.yml
```

## 2. Check if GitHub Actions is Enabled

1. Go to your GitHub repository
2. Click on **Settings** → **Actions** → **General**
3. Ensure "Allow all actions and reusable workflows" is selected
4. Scroll down and ensure "Workflow permissions" allows read and write permissions

## 3. Verify Workflow File is Committed and Pushed

```bash
# Check if file is tracked
git ls-files .github/workflows/deploy-ec2.yml

# If not, add and commit it
git add .github/workflows/deploy-ec2.yml
git commit -m "Add deployment workflow"
git push origin master  # or main, depending on your branch
```

## 4. Check Branch Name

The workflow triggers on:
- `main`
- `master`
- `production`

Verify your current branch:
```bash
git branch --show-current
```

If you're on a different branch, either:
- Push to one of the trigger branches, OR
- Use "workflow_dispatch" to manually trigger it from GitHub UI

## 5. Manual Trigger (workflow_dispatch)

You can manually trigger the workflow:
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select "Deploy to EC2" workflow
4. Click "Run workflow" button
5. Select branch and click "Run workflow"

## 6. Check Workflow Runs

1. Go to **Actions** tab in your GitHub repository
2. Look for any workflow runs (even failed ones)
3. Click on a run to see detailed logs

## 7. Verify Required Secrets

The workflow requires these GitHub Secrets:
- `EC2_SSH_PRIVATE_KEY` - Your EC2 SSH private key
- `EC2_HOST` - Your EC2 instance IP or domain
- `EC2_USER` - SSH user (usually `ubuntu` or `deploy`)
- `EC2_DOMAIN` - (Optional) Your domain name for health checks

To add secrets:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret with the exact name above

## 8. Check YAML Syntax

Validate YAML syntax:
```bash
# Install yamllint if needed
pip install yamllint

# Check syntax
yamllint .github/workflows/deploy-ec2.yml
```

Or use an online YAML validator.

## 9. Check GitHub Actions Logs

1. Go to **Actions** tab
2. If you see a workflow run, click on it
3. Check for any error messages
4. Common errors:
   - Missing secrets
   - SSH connection failures
   - Permission denied errors

## 10. Test Workflow Syntax

GitHub will show syntax errors in the Actions tab. If the workflow file has syntax errors:
- It won't appear in the Actions tab, OR
- It will show a red X with error details

## Quick Fix Checklist

- [ ] Workflow file exists at `.github/workflows/deploy-ec2.yml`
- [ ] File is committed and pushed to repository
- [ ] GitHub Actions is enabled in repository settings
- [ ] You're pushing to `main`, `master`, or `production` branch
- [ ] All required secrets are added in GitHub Settings
- [ ] YAML syntax is valid
- [ ] Check Actions tab for any error messages

## Still Not Working?

1. **Check repository visibility**: Private repos need GitHub Actions enabled
2. **Check account permissions**: Ensure you have admin access to the repo
3. **Try manual trigger**: Use workflow_dispatch to test if workflow file is valid
4. **Check GitHub status**: Visit https://www.githubstatus.com/ to ensure GitHub Actions is operational

## Common Error Messages

### "Resource not accessible by integration"
- **Fix**: Go to Settings → Actions → General → Workflow permissions → Select "Read and write permissions"

### "Secrets not found"
- **Fix**: Add the required secrets in Settings → Secrets and variables → Actions

### "Workflow file not found"
- **Fix**: Ensure the file is at `.github/workflows/deploy-ec2.yml` and is committed

### "Permission denied (publickey)"
- **Fix**: Check that `EC2_SSH_PRIVATE_KEY` secret contains the correct private key


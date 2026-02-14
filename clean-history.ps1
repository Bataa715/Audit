# Script to remove .env.local from Git history

Write-Host "Starting Git history cleanup..." -ForegroundColor Yellow
Write-Host ""

# Suppress warning
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

# Remove .env.local from all commits
Write-Host "Removing apps/nextn/.env.local from all commits..." -ForegroundColor Cyan
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch apps/nextn/.env.local" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Successfully removed .env.local from Git history!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Review changes: git log --oneline" -ForegroundColor White
    Write-Host "2. Force push to remote: git push origin --force --all" -ForegroundColor White
    Write-Host ""
    Write-Host "WARNING: Force push will rewrite history on GitHub!" -ForegroundColor Red
    Write-Host "Make sure no one else is working on this repository." -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "Failed to clean Git history" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}

# Clean up backup refs
Write-Host ""
Write-Host "Cleaning up backup refs..." -ForegroundColor Cyan
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green

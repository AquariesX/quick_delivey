# Git Best Practices for Quick Delivery Project

## 🚨 Important Security Notes

### Never Commit These Files:
- `firebase-service-account.json` - Contains sensitive Firebase credentials
- `.env*` files - Contains environment variables and API keys
- `*.key`, `*.pem` - Private keys and certificates
- `config.json`, `secrets.json` - Configuration files with secrets
- Database files (`*.db`, `*.sqlite`)

### If You Accidentally Commit Secrets:
1. **Immediately** remove the file from Git tracking:
   ```bash
   git rm --cached filename.json
   ```
2. Add the file to `.gitignore`
3. Use `git filter-branch` to remove from history:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch filename.json" --prune-empty --tag-name-filter cat -- --all
   ```
4. Force push the cleaned history:
   ```bash
   git push origin main --force
   ```

## 🛠️ Git Helper Scripts

### For PowerShell Users:
```powershell
.\git-helper.ps1
```

### For Command Prompt Users:
```cmd
git-helper.bat
```

## 📋 Common Git Commands

### Safe Push to Main:
```bash
# Check status first
git status

# Add changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to main
git push origin main
```

### Pull Latest Changes:
```bash
git pull origin main
```

### Create New Branch:
```bash
git checkout -b feature/your-feature-name
```

### Switch Branches:
```bash
git checkout main
git checkout feature/your-feature-name
```

## 🔒 Security Checklist Before Pushing

- [ ] No `.env` files in staging
- [ ] No `firebase-service-account.json` in staging
- [ ] No API keys or secrets in code
- [ ] No database files
- [ ] No private keys or certificates
- [ ] All sensitive files are in `.gitignore`

## 🚀 Quick Commands

### Daily Workflow:
1. `git pull origin main` - Get latest changes
2. Make your changes
3. `git add .` - Stage changes
4. `git commit -m "Description"` - Commit changes
5. `git push origin main` - Push to main

### Emergency Commands:
- **Undo last commit**: `git reset --soft HEAD~1`
- **Undo all changes**: `git checkout -- .`
- **Check what's staged**: `git status`
- **View commit history**: `git log --oneline`

## 📞 Troubleshooting

### Push Rejected Due to Secrets:
1. Follow the security removal steps above
2. Contact repository admin if needed
3. Use GitHub's secret scanning bypass if authorized

### Merge Conflicts:
1. `git pull origin main`
2. Resolve conflicts in your editor
3. `git add .`
4. `git commit -m "Resolve merge conflicts"`
5. `git push origin main`

### Branch Issues:
- **Delete local branch**: `git branch -d branch-name`
- **Delete remote branch**: `git push origin --delete branch-name`
- **List all branches**: `git branch -a`

## 🎯 Best Practices

1. **Always pull before pushing**
2. **Use descriptive commit messages**
3. **Commit frequently with small changes**
4. **Never commit secrets or sensitive data**
5. **Use branches for features**
6. **Review changes before committing**
7. **Keep your local main branch updated**

## 🔧 PowerShell vs Command Prompt

### PowerShell Issues:
- Use `;` instead of `&&` for command chaining
- Use `.\script.ps1` to run PowerShell scripts
- Use `Get-Content` instead of `type`

### Command Prompt:
- Use `&&` for command chaining
- Use `script.bat` to run batch files
- Use `type` to read files

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Git Best Practices](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)

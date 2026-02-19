# Remove Cursor Agent as a Contributor

## Remove as collaborator (recommended)

1. Open **https://github.com/UtkarshSingh-06/Taxigo**
2. Go to **Settings** → **Collaborators and teams** (under Access).
3. Find **Cursor Agent** (or the Cursor-related account) and click **Remove**.

[GitHub: Removing a collaborator](https://docs.github.com/articles/removing-a-collaborator-from-a-personal-repository)

## If Cursor appears in the Contributors list

Contributors are based on **commit author**. Your current history already uses **UtkarshSingh-06**; after a push, the list may still need a few minutes or a hard refresh (Ctrl+Shift+R). If Cursor still appears, run this **on your machine** (e.g. in Git Bash) to rewrite all commits to your identity, then force push:

```bash
git filter-branch -f --env-filter "export GIT_AUTHOR_NAME='UtkarshSingh-06'; export GIT_AUTHOR_EMAIL='utkarsh.yash77@gmail.com'; export GIT_COMMITTER_NAME='UtkarshSingh-06'; export GIT_COMMITTER_EMAIL='utkarsh.yash77@gmail.com';" --tag-name-filter cat -- --all
git push origin --force --all
```

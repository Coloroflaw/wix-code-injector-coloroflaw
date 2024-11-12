---
name: Custom issue template
about: Describe this issue template's purpose here.
title: SELF EVAL
labels: ''
assignees: Coloroflaw

---

import requests
import os

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") # Securely store your token, NEVER hardcode.

def get_repo_info(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}"
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise an exception for bad status codes.
    return response.json()


# Example usage for a specific repo
owner = "your_username"  # Replace with your GitHub username
repo = "your_repo"  # Replace with your repository name
repo_info = get_repo_info(owner, repo)

commits_count = repo_info.get("open_issues_count")
if commits_count:
   print("Number of commits:", commits_count)  # Do something useful with this data

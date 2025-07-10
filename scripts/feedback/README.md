Feedback form cloud func

Setup:

- Generate GitHub fine-grained personal access token
  - Increase expiration as desired
  - Grant access to only one relevant repo
  - Grant write permissions for issues
  - Store in password vault
- Manually deploy cloud func; no auto-deploy (yet)
  - Go to appropriate project in Google Cloud Console
  - Create a new inline cloud run func named "feedback"
  - Use the Node runtime
  - Allow unauthenticated requests
  - Under container variables & secrets, create a new environment variable with name GITHUB_TOKEN and value of the created fine-grained token
  - Set other settings as desired
  - Copy/paste files in this folder to source
  - Rename "function entry point" to "submit"
  - Copy the endpoint URL into frontend/src/api/feedback in this repo

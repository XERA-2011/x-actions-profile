# X Profile Charts

Generate Snake, Stats, and Top Langs SVGs for your GitHub Profile.

## Usage

Create a workflow file (e.g., `.github/workflows/profile-charts.yml`) with the following content:

```yaml
name: Generate Profile Charts

on:
  # Run automatically every 24 hours
  schedule:
    - cron: "0 */24 * * *" 
  
  # Allows to manually run the job at any time
  workflow_dispatch:
  
  # Run on every push on the master branch
  push:
    branches:
    - main

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      # generates a snake game from a github user (<github_user_name>) contributions graph, output a svg animation at <svg_out_path>
      - name: Generate Charts
        uses: XERA-2011/x-actions@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          user: ${{ github.repository_owner }}
          output_dir: dist
          types: snake,stats,top-langs

      # push the content of <build_dir> to a branch
      # the content will be available at https://cdn.jsdelivr.net/gh/<github_user>/<repository>@<target_branch>/<file> , or as github page
      - name: Push to GitHub Pages
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `token` | GitHub Token (e.g., `${{ secrets.GITHUB_TOKEN }}`) | **Yes** | |
| `user` | GitHub Username | **Yes** | |
| `output_dir` | Directory to output SVGs | No | `dist` |
| `types` | Comma separated list of charts to generate: `snake`, `stats`, `top-langs` | No | `snake,stats,top-langs` |

## Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Run the action locally (requires `.env` file with `INPUT_TOKEN` and `INPUT_USER`):
   ```bash
   pnpm test
   ```

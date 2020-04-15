# Waellet Contributing Guidelines

Contributions are more than welcome and we love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We develop with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We use gitflow, so all code changes happen through Pull Requests
Pull requests are the best way to propose changes to the codebase ([gitflow](https://danielkummer.github.io/git-flow-cheatsheet/)). We actively welcome your pull requests:

### Development
- Fork the repo and create your branch from `develop`.
- Development of features happens in branches made from `develop` prefixed with `feature/` like for example: `feature/show-token-balance`.
- If you've added code that should be tested, add tests.
- If you've changed APIs, update the documentation.
- Ensure the test suite passes.
- Make sure your code lints.
- When development is finished - issue that pull request! A pull request to `develop` should be created. At least one person has to review the PR and when everything is fine the PR gets merged.
- We have automated testing via Travis and CircleCI on every PR.

### Releases
- To make a new release create a release branch called `release/vX.X.X`, also bump the version number in `package.json` in this branch.
- Create a PR to `master` which then also has to be accepted.
- Create a tag for this version and push the tag.
- Also merge back the changes (like the version bump) into `develop`.
- The `master` branch has to be deployed to the production environment manually.

## Any contributions you make will be under the ISC Software License
In short, when you submit code changes, your submissions are understood to be under the same ISC License that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's issues
We use GitHub issues to track public bugs. 
If you spot an issue or bug while testing/using the waellet, you can report it by opening a [new issue](https://github.com/waellet/waellet/issues) - it's that easy! 

## Write bug reports with detail, background, and sample code
We have issue templates for bug reports and feature requests. Please make sure you follow the guidelines there so its easier for the maintainers and other contributors.

### Great Bug Reports tend to have:

- A quick summary and/or background
- Steps to reproduce
- Be specific!
- Give sample code if you can. Sample code allows anyone to run and reproduce what you are seeing
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)
- People love thorough bug reports. I'm not even kidding.

## Use a Consistent Coding Style

- 2 spaces for indentation rather than tabs
- You can try running `npm run lint` for style unification

## License

By contributing, you agree that your contributions will be licensed under its ISC License.



If you want to help us with building this amazing project [submit your PR](https://github.com/waellet/waellet/pulls)!

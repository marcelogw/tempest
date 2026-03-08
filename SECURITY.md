# Security Policy

## Supported Versions

Only the latest version on `main` is actively maintained.

| Version        | Supported |
| -------------- | --------- |
| latest (main)  | ✅        |
| older releases | ❌        |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/marcelogw/tempest/security/advisories/new).

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive a response within **72 hours**. If the vulnerability is confirmed, a fix will be prioritised and a patch released as soon as possible. You will be credited in the release notes unless you prefer to remain anonymous.

## Scope

This policy covers the Tempest application code in this repository. It does not cover:

- Third-party dependencies (report those to the respective maintainers)
- AWS Amplify / Cognito infrastructure (report to AWS)
- Vercel infrastructure (report to Vercel)

## Security Considerations

### Local mode

In local mode all data is stored in the browser's `localStorage`. No data leaves the device. There is no authentication.

### Cloud mode

In cloud mode data is stored in AWS Amplify (DynamoDB) and access is controlled by Cognito. Each workspace maps to a Cognito group. Users can only read and write data within their own workspace group.

# Report Backend Application

[![CircleCI](https://circleci.com/gh/toei-jp/report-backend.svg?style=svg)](https://circleci.com/gh/toei-jp/report-backend)

## Table of contents

* [Usage](#usage)
* [License](#license)

## Usage

### Environment variables

| Name                             | Required | Value            | Purpose                      |
| -------------------------------- | -------- | ---------------- | ---------------------------- |
| `DEBUG`                          | false    | report-backend:* | Debug                        |
| `NODE_ENV`                       | true     |                  | Environment name             |
| `REDIS_PORT`                     | true     |                  | Redis Cache Connection       |
| `REDIS_HOST`                     | true     |                  | Redis Cache Connection       |
| `REDIS_KEY`                      | true     |                  | Redis Cache Connection       |
| `API_ENDPOINT`                   | true     |                  |                              |
| `API_AUTHORIZE_SERVER_DOMAIN`    | true     |                  |                              |
| `API_CLIENT_ID`                  | true     |                  |                              |
| `API_CLIENT_SECRET`              | true     |                  |                              |
| `API_CODE_VERIFIER`              | true     |                  |                              |

## License

ISC

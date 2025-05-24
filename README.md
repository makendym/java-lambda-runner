# Java Lambda Runner

A TypeScript-based AWS Lambda function that provides Java execution capabilities within a serverless environment. This project combines the power of Node.js and Java to create a flexible serverless solution.

## Features

- TypeScript-based AWS Lambda function
- Java 8 runtime support
- Docker containerization for consistent deployment
- UUID generation capabilities
- AWS Lambda integration

## Prerequisites

- Node.js (v14.17 or higher)
- npm (Node Package Manager)
- Docker (for local testing)
- AWS CLI (for deployment)
- Java 8 (for local development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/makendym/java-lambda-runner.git
cd java-lambda-runner
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Development

The project is written in TypeScript and uses the following main dependencies:
- `@types/aws-lambda`: TypeScript definitions for AWS Lambda
- `uuid`: For generating unique identifiers
- `typescript`: For TypeScript compilation

## Docker Support

The project includes a Dockerfile that:
- Uses AWS Lambda Node.js 22 base image
- Installs Java 8 (Amazon Corretto)
- Sets up the necessary environment for running Java code
- Builds and packages the TypeScript code

To build the Docker image:
```bash
docker build -t java-lambda-runner .
```

## Deployment

The Lambda function can be deployed to AWS using the provided Docker image. The function is configured to use the handler in `dist/handler.js`.

## Project Structure

```
java-lambda-runner/
├── src/              # TypeScript source files
├── dist/             # Compiled JavaScript files
├── Dockerfile        # Docker configuration
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── .gitignore       # Git ignore rules
```

## License

This project is licensed under the terms of the included LICENSE file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# Use the AWS Lambda Node.js base image
FROM public.ecr.aws/lambda/nodejs:22

# Install Java 8
RUN dnf install -y java-1.8.0-amazon-corretto-devel

# Set working directory
WORKDIR /var/task

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build && \
    ls -la dist/ && \
    cp -r dist/* ./

# Command for Lambda to run
CMD ["handler.handler"]
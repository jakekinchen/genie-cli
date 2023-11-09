# Genie CLI

Genie CLI is a command-line interface tool designed to interact with the OpenAI Assistants API, allowing users to manage and communicate with AI assistants directly from their terminal with full access to their codebase. It simplifies the process of creating, updating, and linking AI-powered features to your projects.

## Features

- Create and manage OpenAI assistants
- Start conversations with your AI assistant from the command line
- Update assistant's knowledge with project-specific information
- Link and unlink code or error handling capabilities
- Log errors to a JSON file for debugging

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- An OpenAI API key

### Installation

1. Navigate to project root and clone the repository here:

```sh
git clone https://github.com/jakekinchen/genie-cli.git
cd genie-ai-cli

2. Once inside the project directory, install the dependencies

3. Create a `.env` file in the root directory and add your OpenAI API key:

4. Set assistant instructions and description in config.js

5. type `npm link` to create a global symlink to the project

6. type `genie start` to start the assistant

7. type `genie link code` to make the code available to the assistant

8. type `genie help` to see a list of available commands

```
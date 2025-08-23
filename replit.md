# Overview

DTA Mind is a workflow automation platform that allows users to create visual workflows using a drag-and-drop interface. The application enables users to build automated processes by connecting different types of nodes (inputs, AI processing, data manipulation, and outputs) in a visual canvas. It's built as a full-stack web application with a React frontend and Express backend, designed for creating and executing AI-powered automation workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Flow Builder**: ReactFlow for the visual workflow canvas and node connections

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints for workflows, executions, and templates
- **Development Server**: Custom Vite integration for hot module replacement
- **Request Handling**: JSON body parsing with request/response logging middleware
- **Error Handling**: Centralized error middleware with status code mapping

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Connection**: Neon Database serverless PostgreSQL for production

## Authentication and Authorization
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **User System**: Simple username/password authentication with default demo user
- **Authorization**: Basic user-scoped data access for workflows and executions

## External Dependencies

### AI Services
- **OpenAI Integration**: GPT-4o model for chat completions and AI processing nodes
- **API Configuration**: Environment variable-based API key management
- **Service Layer**: Abstracted OpenAI service for chat completions and sentiment analysis

### Development Tools
- **Replit Integration**: Custom vite plugins for Replit development environment
- **Build System**: ESBuild for server-side bundling, Vite for client bundling
- **Type Checking**: TypeScript with strict mode enabled across client and server

### UI Components
- **Design System**: Comprehensive Shadcn/ui component library
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS-based animations with Tailwind utilities
- **Form Handling**: React Hook Form with Zod validation

### Workflow Engine
- **Node Types**: Extensible system for input, AI, processing, and output nodes
- **Execution Engine**: Sequential workflow execution with context passing
- **Templates**: Pre-built workflow templates for common use cases
- **Validation**: Zod schemas for runtime data validation
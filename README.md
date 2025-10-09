# Polymer Trading Management System

**What It Is**
A web + mobile app to manage a polymer trading business processing 15-30 deals per day. Replace manual Excel workflows with automated deal entry, messaging, and business intelligence.

## 🎯 Project Status & Roadmap

### Pre-MVP (Foundation - COMPLETED ✅)
- Supabase database with 34,200 historical deals
- 200 customers, 200 suppliers, 312 products imported
- GitHub repository with Next.js 14 + TypeScript
- Vercel deployment connected
- Project structure ready for development

### MVP Features (Building Now)

**1. Deal Entry**
- Simple form: customer, product, quantity, price
- Real-time cost calculation (base + charges + GST + TCS = margin)
- One-click save

**2. Automated Messaging**
- Click "Register Deal" → auto-sends WhatsApp + Telegram notifications
- Template-based messages with deal details
- Retry logic for failed sends

**3. Google Sheets Sync**
- Every deal automatically updates a Google Sheet row
- Keeps existing spreadsheet workflow working

**4. Deal List**
- View all deals in table
- Search and filter (date, customer, product, price)
- Click deal → see full details with cost breakdown

**5. Health Dashboard**
- Shows status: Database ✅, WhatsApp ✅, Telegram ✅, Sheets ✅
- View failed messages + retry button
- Manual "Test Now" button for full system check

**MVP Flow**: Create deal → Send messages → Update sheet → View in list → Monitor health

**After MVP works**: Dashboard, Chat with Data, Price Lists, Inventory, etc.

---

A comprehensive polymer trading management system built with Next.js 14, TypeScript, and Supabase. This application manages deals, customers, suppliers, products, and automated messaging for polymer trading operations.

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library (Slate theme)
- **Lucide React** - Icon library
- **Recharts** - Chart and data visualization library

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL)
- **Supabase Auth** - Authentication system
- **Row Level Security (RLS)** - Database security

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation bridge

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Git** - Version control

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (login, signup)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── deals/               # Deal management pages
│   │   ├── health/              # System health monitoring
│   │   └── layout.tsx           # Dashboard layout wrapper
│   ├── api/                     # API endpoints
│   │   ├── deals/               # Deal-related API routes
│   │   ├── messages/            # Message/notification APIs
│   │   └── health/              # Health check APIs
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components (Button, Input, etc.)
│   ├── deals/                   # Deal-specific components
│   ├── forms/                   # Form components
│   └── layout/                  # Layout components (Header, Sidebar)
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client (admin)
│   └── utils.ts                 # Utility functions
├── types/
│   ├── database.types.ts        # Generated Supabase types
│   └── index.ts                 # Common type exports and aliases
└── hooks/                       # Custom React hooks
```

## 🗄️ Database Schema

### Business Core Tables

#### `customers` (200 records)
```sql
- id (UUID, Primary Key)
- Name (Text, Unique)
- created_at (Timestamp)
```

#### `suppliers` (200 records)
```sql
- id (UUID, Primary Key)
- Name (Text, Unique)
- created_at (Timestamp)
```

#### `products` (312 records)
```sql
- id (UUID, Primary Key)
- Product (Text)
- Grade (Text)
- Company (Text)
- Specific Grade (Text)
- created_at (Timestamp)
```

### Deal Management Tables

#### `deals_unified` (34,200 records) ⭐ **Main Operational Table**
```sql
- id (UUID, Primary Key)
- SrNo (Text, Nullable) - Serial Number
- Date (Date, Nullable)
- Sale Party (Text, Nullable)
- Quantity Sold (Numeric, Nullable)
- Sale Rate (Numeric, Nullable)
- Product (Text, Nullable)
- Grade (Text, Nullable)
- Company (Text, Nullable)
- Specific Grade (Text, Nullable)
- Purchase Party (Text, Nullable)
- Quantity Purchased (Numeric, Nullable)
- Purchase Rate (Numeric, Nullable)
- created_at (Timestamp, Nullable)
- updated_at (Timestamp, Nullable)
```

#### Historical Deal Tables
- `deals_1` (11,622 records) - Historical data set 1
- `deals_2` (9,999 records) - Historical data set 2
- `deals_3` (12,579 records) - Historical data set 3

*Note: deals_1, deals_2, deals_3 have identical structure to deals_unified but with non-nullable fields*

### Communication System

#### `message_templates`
```sql
- id (UUID, Primary Key)
- name (Text, Unique)
- platform (Text) - 'whatsapp'|'telegram'|'both'
- template_text (Text)
- whatsapp_template_id (Text, Nullable)
- variables (JSONB, Nullable)
- is_active (Boolean, Default: true)
- created_at (Timestamp)
```

#### `message_outbox`
```sql
- id (UUID, Primary Key)
- deal_id (UUID)
- platform (Text) - 'whatsapp'|'telegram'
- recipient_phone (Text)
- message_text (Text)
- status (Text) - 'pending'|'sending'|'sent'|'delivered'|'failed'|'dead_letter'
- attempts (Integer, Default: 0)
- max_attempts (Integer, Default: 3)
- external_message_id (Text, Nullable)
- error_message (Text, Nullable)
- sent_at (Timestamp, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### System Operations

#### `health_checks`
```sql
- id (UUID, Primary Key)
- check_type (Text)
- status (Text) - 'healthy'|'degraded'|'down'
- response_time_ms (Integer, Nullable)
- error_message (Text, Nullable)
- checked_at (Timestamp)
```

#### `sheets_sync_log`
```sql
- id (UUID, Primary Key)
- deal_id (UUID)
- sheet_id (Text)
- row_number (Integer, Nullable)
- status (Text) - 'pending'|'synced'|'failed'
- error_message (Text, Nullable)
- synced_at (Timestamp, Nullable)
- created_at (Timestamp)
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanaymehhta/onemorepolymer.git
   cd onemorepolymer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://onmorepolymer.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

4. **Generate TypeScript types from Supabase**
   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase

   # Login to Supabase
   supabase login --token your_access_token

   # Generate types
   supabase gen types typescript --project-id zgmdcpalxfvilhckisuf --schema public > src/types/database.types.ts
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🏗️ Architecture Overview

### Business Flow
1. **Products Management** - Define polymer products with grades and specifications
2. **Party Management** - Manage customers and suppliers
3. **Deal Processing** - Record buy/sell transactions with detailed tracking
4. **Communication** - Automated messaging system for notifications
5. **Monitoring** - System health checks and sync logging
6. **Integration** - Google Sheets synchronization for data exchange

### Key Features
- **Deal Tracking** - Complete buy/sell transaction management
- **Product Catalog** - Comprehensive polymer product database
- **Party Management** - Customer and supplier relationship management
- **Automated Messaging** - WhatsApp/Telegram integration for notifications
- **Health Monitoring** - System status tracking and alerting
- **Data Synchronization** - Google Sheets integration
- **Type Safety** - Full TypeScript coverage with Supabase types

### Development Patterns
- **Route Groups** - Organized using Next.js 13+ route groups `(auth)`, `(dashboard)`
- **Server Components** - Leverage Next.js server components for performance
- **Type Safety** - Comprehensive TypeScript types from Supabase schema
- **Component Organization** - Modular component structure with shadcn/ui
- **Form Handling** - React Hook Form with Zod validation

## 🔐 Security Considerations

- Environment variables for sensitive data
- Supabase Row Level Security (RLS) policies
- Type-safe database operations
- Input validation with Zod schemas
- Secure API endpoints

## 📊 Data Insights

- **Total Deals**: 34,200+ transactions across all tables
- **Products**: 312 unique polymer products with grades
- **Parties**: 400 total (200 customers + 200 suppliers)
- **Active Systems**: Messaging, health monitoring, and sync logging

## 🚀 Deployment

The application is configured for deployment on Vercel with Supabase backend. Environment variables should be configured in the deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Type Aliases
Convenient type aliases are available in `src/types/index.ts`:
```typescript
import type { Deal, DealInsert, DealUpdate, Customer, Supplier, Product } from '@/types'
```

### Supabase Clients
- `src/lib/supabase/client.ts` - Browser client for client-side operations
- `src/lib/supabase/server.ts` - Admin client for server-side operations

### Component Guidelines
- Use shadcn/ui components for consistent design
- Follow the established folder structure
- Implement proper TypeScript types
- Use React Hook Form for form handling

## 🤖 OpenAI Agents SDK - Best Practices Guide

Based on our hands-on experience building conversational agents, here are essential do's and don'ts for using the OpenAI Agents SDK effectively:

### ✅ DO's

#### **Conversation Memory Management**
- **DO** use the SDK's built-in `history` property from `run()` results
- **DO** store and pass conversation history between agent runs: `sessionHistory = result.history`
- **DO** provide session-level history storage for contextual conversations
- **DO** add "clear" commands to reset conversation memory when needed

#### **Agent Design**
- **DO** create specialized agents for different tasks (financial analysis, competitive research, etc.)
- **DO** use detailed, specific instructions with clear examples in agent prompts
- **DO** include context-aware instructions that reference conversation history
- **DO** implement proper triage/routing systems to direct questions to appropriate agents

#### **Error Handling & Debugging**
- **DO** implement robust JSON parsing with fallback extraction: `jsonMatch = response.match(/\{.*\}/)`
- **DO** add comprehensive logging for debugging: conversation length, routing decisions, API responses
- **DO** use try-catch blocks around all agent operations
- **DO** provide user-friendly error messages while logging detailed errors for debugging

#### **Data Integration**
- **DO** cache API responses (financial data, etc.) to avoid rate limits
- **DO** integrate real data sources (Alpha Vantage, etc.) for accurate analysis
- **DO** use proper environment variable management for API keys
- **DO** implement ticker/company name mapping for user convenience

### ❌ DON'Ts

#### **Conversation Memory Mistakes**
- **DON'T** call `run(agent, prompt)` independently each time - this loses all context
- **DON'T** manually manage conversation arrays - use the SDK's `history` property
- **DON'T** forget to pass conversation history to subsequent agent runs
- **DON'T** assume agents remember previous conversations without explicit history passing

#### **Agent Architecture Mistakes**
- **DON'T** create one monolithic agent for all tasks - use specialized agents
- **DON'T** use generic prompts without specific examples and format requirements
- **DON'T** ignore follow-up questions and references to previous context
- **DON'T** rely on menu-driven interfaces when natural language parsing works better

#### **Common Technical Mistakes**
- **DON'T** assume JSON responses are always valid - implement robust parsing
- **DON'T** use wrong package names: it's `@openai/agents`, not `openai-agents`
- **DON'T** call `Runner.run()` - use `run()` function directly
- **DON'T** access `result.final_output` - use `result.finalOutput` (camelCase)

#### **User Experience Mistakes**
- **DON'T** force users through complex menu systems for simple questions
- **DON'T** make users specify question types when AI can determine intent
- **DON'T** lose context between related questions in the same conversation
- **DON'T** provide generic responses when specific, contextual answers are expected

### 💡 Key Learnings

1. **The SDK has built-in memory management** - don't reinvent it
2. **Context is everything** - follow-up questions depend on conversation history
3. **Specialized agents work better** than one do-everything agent
4. **Natural language parsing** beats menu-driven interfaces
5. **Error handling is crucial** - agents fail in unpredictable ways

### 🎯 Example Implementation Pattern

```javascript
// ✅ Correct: Conversation-aware agent calls
let sessionHistory = [];

async function processQuestion(userQuestion) {
  // Add user message to history
  sessionHistory.push({ role: 'user', content: userQuestion });

  // Run with context
  const result = await run(agent, sessionHistory);

  // Update history with response
  sessionHistory = result.history;

  return result.finalOutput;
}

// ❌ Wrong: Independent calls without memory
async function processQuestion(userQuestion) {
  const result = await run(agent, userQuestion); // No context
  return result.finalOutput;
}
```

This guide is based on real implementation experience and mistakes we made while building the interactive company research system.

## 🔄 TODO

- **Authentication System**: Login/signup functionality needs to be implemented

---

**Repository**: https://github.com/tanaymehhta/onemorepolymer
**Supabase Project**: https://onmorepolymer.supabase.co
**Built with**: Next.js 14, TypeScript, Supabase, Tailwind CSS

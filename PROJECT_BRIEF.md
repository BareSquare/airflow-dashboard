# Airflow Monitoring Dashboard - Project Brief

## 🎯 Project Goal
Build a modern, responsive web dashboard for monitoring Apache Airflow DAGs using the Astronomer Cloud REST API. This is a training project to learn AI coding agents (Claude Code/OpenAI Codex) with a **maximum 4-5 hour implementation timeline**.

---

## 📋 Quick Facts
- **Timeline**: 4-5 hours total
- **Airflow Host**: Astronomer Cloud
- **Deployment**: Netlify (with GitHub auto-deploy)
- **Security**: Netlify Functions as API proxy (tokens never exposed to client)
- **Audience**: Internal team use only

---

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API or Axios
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide React

### Backend
- **Serverless**: Netlify Functions (Node.js)
- **Purpose**: Secure proxy between frontend and Airflow API

### Deployment
- **Platform**: Netlify
- **CI/CD**: GitHub integration (auto-deploy on push)

---

## 🏛️ Architecture

```
┌──────────────┐         ┌───────────────────┐         ┌──────────────────┐
│   Browser    │  HTTPS  │ Netlify Functions │  HTTPS  │   Astronomer     │
│  (React UI)  │────────▶│   (API Proxy)     │────────▶│  Airflow REST    │
└──────────────┘         └───────────────────┘         └──────────────────┘
                                  │
                                  │ Reads credentials from
                                  ▼
                          ┌───────────────────┐
                          │ Environment Vars  │
                          │  (Netlify secure) │
                          └───────────────────┘
```

**Security Pattern:**
- Frontend calls relative paths: `/api/dags`, `/api/dag-runs`
- Netlify Functions handle authentication and forward to Airflow
- API token stored in Netlify environment variables (encrypted, never in code)
- Client never sees or handles the API token

---

## 🔐 Airflow API Integration

### Authentication & Base URL
- **Base URL**: `https://<deployment-id>.astronomer.run/api/v1/`
- **Auth Method**: Bearer token (HTTP header)
- **Token Type**: Read-only access token (no write/trigger permissions)
- **Documentation**: [Airflow REST API Reference](https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html)

### Key Endpoints to Implement

#### 1. List All DAGs
```
GET /dags
Query params: limit, offset
Returns: Array of DAG objects with metadata
```

#### 2. Get DAG Details
```
GET /dags/{dag_id}
Returns: Specific DAG information (schedule, owner, etc.)
```

#### 3. List DAG Runs
```
GET /dags/{dag_id}/dagRuns
Query params:
  - limit (default: 100)
  - offset (pagination)
  - execution_date_gte (filter: runs after date)
  - execution_date_lte (filter: runs before date)
  - state (filter: success, failed, running, queued)
Returns: Array of DAG run objects
```

#### 4. Get Task Instances
```
GET /dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances
Returns: All task instances for a specific DAG run
```

#### 5. Get Event Logs (for errors/warnings)
```
GET /eventLogs
Query params:
  - dag_id
  - task_id
  - event
  - limit
Returns: Event log entries
```

**Response Structure Examples:**

DAG Object:
```json
{
  "dag_id": "example_dag",
  "is_paused": false,
  "is_active": true,
  "last_parsed_time": "2025-11-18T10:00:00+00:00",
  "schedule_interval": "0 0 * * *",
  "tags": []
}
```

DAG Run Object:
```json
{
  "dag_run_id": "scheduled__2025-11-18T00:00:00+00:00",
  "dag_id": "example_dag",
  "execution_date": "2025-11-18T00:00:00+00:00",
  "start_date": "2025-11-18T00:05:00+00:00",
  "end_date": "2025-11-18T00:15:00+00:00",
  "state": "success",
  "external_trigger": false
}
```

---

## ✨ Features & Requirements

### 🎯 MVP Features (Priority 1 - Must Have)

#### 1. Dashboard Home Page
Display key metrics at a glance:
- **Total DAGs count**
- **Currently running DAGs** (state = 'running')
- **Recent failures** (last 24 hours)
- **Success rate** (last 24 hours percentage)

Present as large, colorful metric cards in a grid layout.

#### 2. DAG List View
Comprehensive table/grid of all DAGs with:
- DAG name (clickable → detail view)
- Active/Paused status indicator
- Last run status (success/failed/running)
- Last run timestamp (relative: "2 hours ago")
- Schedule interval (cron or readable format)

**Interactions:**
- Filter dropdown: All / Active / Paused
- Search input: Filter by DAG name (client-side)
- Click DAG name → Navigate to detail view

#### 3. DAG Detail View
Dedicated page for single DAG showing:

**Header Section:**
- DAG name (large)
- Status badge (active/paused)
- Schedule interval
- Last run status

**Recent Runs Section:**
- Table of last 20 runs with columns:
  - Run ID
  - Start Time (formatted)
  - Duration (calculated from start/end)
  - Status (color-coded badge)
- Click row → Expand to show task instances (optional stretch goal)

**Statistics Panel:**
- Total runs (all time)
- Successful runs count
- Failed runs count
- Average execution duration

#### 4. Error/Warning Log View
Dedicated page showing recent failures:
- **Columns:**
  - Timestamp
  - DAG name (clickable → detail)
  - Task name
  - Error message (truncated, show full on click/hover)
- **Filters:**
  - Dropdown: Filter by specific DAG
  - Date range (optional)
- **Pagination:** 20 items per page

#### 5. Responsive Design Requirements
- **Mobile-first approach**: Works on phones, tablets, desktops
- **Loading states**: Spinner/skeleton during API calls
- **Error handling**: User-friendly messages when API fails
- **Empty states**: Helpful messages when no data available
- **Consistent spacing**: Clean, professional layout

### 🚀 Phase 2 Features (Optional - If Time Permits)

#### 6. Visualizations
- Line chart: Success/failure trends over last 7-30 days
- Bar chart: Compare execution durations across DAGs
- Pie chart: Status distribution (success/failed/running/other)

#### 7. Time-Based Aggregated Stats
- Toggle view: Day / Week / Month / Year
- Show aggregated metrics for selected period
- Date range picker component

#### 8. Auto-Refresh
- Toggle button to enable/disable
- Refresh interval: 30-60 seconds
- Visual indicator when refreshing
- Preserve user's current view/filters

---

## 🎨 UI/UX Guidelines

### Design Principles
- **Clarity over creativity**: Information must be instantly understandable
- **Generous whitespace**: Don't cram content
- **Consistent patterns**: Reuse components, layouts, colors
- **Performance**: Fast loading, smooth transitions

### Color Palette

**Status Colors:**
```css
Success:  #10b981 (green-500)
Failed:   #ef4444 (red-500)
Running:  #3b82f6 (blue-500)
Queued:   #f59e0b (amber-500)
Paused:   #6b7280 (gray-500)
```

**UI Colors:**
```css
Background: #f9fafb (gray-50)
Surface:    #ffffff
Border:     #e5e7eb (gray-200)
Text:       #111827 (gray-900)
Text-muted: #6b7280 (gray-500)
```

### Typography
- **Font**: System font stack (sans-serif)
- **Sizes**: 
  - Headings: text-2xl, text-xl, text-lg
  - Body: text-base
  - Small: text-sm
- **Weight**: 
  - Headings: font-semibold (600)
  - Body: font-normal (400)

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header / Navigation Bar                            │
│  [Logo/Title]  [Dashboard] [DAGs] [Errors] [↻]    │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  Sidebar         │     Main Content Area            │
│  (Optional)      │                                  │
│                  │  [Page-specific content here]    │
│  - Dashboard     │                                  │
│  - All DAGs      │                                  │
│  - Error Logs    │                                  │
│                  │                                  │
└──────────────────┴──────────────────────────────────┘
```

**Alternative (Simpler):**
Top navigation tabs with full-width content below (better for mobile).

### Reusable Components to Build

1. **StatusBadge** 
   - Props: status, size
   - Displays colored badge with icon

2. **MetricCard**
   - Props: title, value, trend (optional), icon
   - Large number display for dashboard

3. **DataTable**
   - Props: columns, data, onRowClick
   - Sortable headers, hover states

4. **LoadingSpinner**
   - Centered spinner with optional message

5. **ErrorAlert**
   - Props: message, type (error/warning/info)
   - Dismissible banner

6. **EmptyState**
   - Props: icon, title, description
   - Shown when no data available

---

## 📁 Project Structure

```
airflow-dashboard/
├── netlify/
│   └── functions/
│       ├── dags.js              # GET /api/dags
│       ├── dag-runs.js          # GET /api/dag-runs?dag_id=X
│       ├── task-instances.js    # GET /api/task-instances?dag_id=X&run_id=Y
│       └── event-logs.js        # GET /api/event-logs
│
├── public/
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Home page with stats cards
│   │   ├── DagList.jsx          # All DAGs table
│   │   ├── DagDetail.jsx        # Single DAG detail page
│   │   ├── ErrorLogs.jsx        # Error/warning logs page
│   │   ├── StatusBadge.jsx      # Reusable status indicator
│   │   ├── MetricCard.jsx       # Dashboard stat card
│   │   ├── LoadingSpinner.jsx   # Loading UI
│   │   ├── ErrorAlert.jsx       # Error message banner
│   │   └── EmptyState.jsx       # No data UI
│   │
│   ├── utils/
│   │   ├── api.js               # API client wrapper
│   │   ├── formatters.js        # Date/duration formatting
│   │   └── constants.js         # Status colors, labels
│   │
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
│
├── .gitignore                   # MUST exclude .env*
├── .env.example                 # Template for env vars (commit this)
├── netlify.toml                 # Netlify config
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md                    # Setup & deployment instructions
```

---

## 🔒 Security Implementation

### Critical Security Rules

1. **NEVER commit API tokens to git**
2. **NEVER call Airflow API directly from React**
3. **ALWAYS proxy through Netlify Functions**
4. **Store all secrets in Netlify environment variables**

### Environment Variables Setup

**File: `.env.example`** (commit to repo as template)
```env
AIRFLOW_API_BASE_URL=https://your-deployment.astronomer.run
AIRFLOW_API_TOKEN=your_read_only_token_here
AIRFLOW_API_VERSION=2
```

**File: `.gitignore`** (must include)
```
.env
.env.local
.env.production
node_modules/
dist/
.netlify/
```

**In Netlify Dashboard** (add after deployment):
```
AIRFLOW_API_BASE_URL = https://[actual-deployment].astronomer.run
AIRFLOW_API_TOKEN = [actual-read-only-token]
AIRFLOW_API_VERSION = 2
```

### Netlify Function Pattern

Every function should follow this structure:

```javascript
// netlify/functions/dags.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Get credentials from environment (server-side only)
  const { AIRFLOW_API_BASE_URL, AIRFLOW_API_TOKEN } = process.env;
  
  // Validate environment
  if (!AIRFLOW_API_BASE_URL || !AIRFLOW_API_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Airflow configuration' })
    };
  }
  
  try {
  const apiUrl = `${AIRFLOW_API_BASE_URL.replace(/\/$/, '')}/api/v2`;
  // Make authenticated request to Airflow
  const response = await fetch(`${apiUrl}/dags`, {
      headers: {
        'Authorization': `Bearer ${AIRFLOW_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Airflow API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return data to frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow frontend calls
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Error fetching DAGs:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch DAGs',
        message: error.message 
      })
    };
  }
};
```

### Frontend API Client Pattern

```javascript
// src/utils/api.js
const API_BASE = '/.netlify/functions';

export const fetchDags = async () => {
  const response = await fetch(`${API_BASE}/dags`);
  if (!response.ok) {
    throw new Error('Failed to fetch DAGs');
  }
  return response.json();
};

export const fetchDagRuns = async (dagId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/dag-runs?dag_id=${dagId}&${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch DAG runs');
  }
  return response.json();
};

// ... more API methods
```

---

## 🚀 Implementation Roadmap

### Phase 1: Project Setup

**Tasks:**
1. Initialize Vite + React project: `npm create vite@latest airflow-dashboard -- --template react`
2. Install dependencies:
   ```bash
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npm install react-router-dom recharts lucide-react
   npm install -D netlify-cli
   ```
3. Configure Tailwind CSS (generate config, update CSS)
4. Create basic folder structure
5. Setup `.gitignore` and `.env.example`
6. Create `netlify.toml` configuration
7. Test local dev server: `npm run dev`

**Deliverables:**
- Project runs locally
- Tailwind styles working
- Folder structure ready

---

### Phase 2: Netlify Functions

**Tasks:**
1. Create `netlify/functions/dags.js` (list all DAGs)
2. Create `netlify/functions/dag-runs.js` (fetch runs for a DAG)
3. Create `netlify/functions/task-instances.js` (fetch tasks)
4. Create `netlify/functions/event-logs.js` (fetch errors)
5. Add error handling to all functions
6. Test locally with: `netlify dev` (requires Netlify CLI)
7. Create `.env.local` with test credentials

**Deliverables:**
- 4 working Netlify Functions
- Can curl endpoints locally and get Airflow data
- Proper error responses

---

### Phase 3: Core UI Components

**Tasks:**
1. **Setup routing** (React Router):
   - `/` → Dashboard
   - `/dags` → DAG List
   - `/dags/:dagId` → DAG Detail
   - `/errors` → Error Logs

2. **Build reusable components**:
   - `StatusBadge.jsx` (15 min)
   - `MetricCard.jsx` (15 min)
   - `LoadingSpinner.jsx` (5 min)
   - `ErrorAlert.jsx` (10 min)

3. **Create API client** (`src/utils/api.js`):
   - Wrapper functions for all endpoints
   - Error handling
   - (15 min)

4. **Build Dashboard page** (30 min):
   - Fetch summary stats
   - Display 4 metric cards
   - Loading and error states

5. **Build DAG List page** (45 min):
   - Fetch and display all DAGs
   - Implement search filter
   - Implement status filter
   - Add click navigation to detail

**Deliverables:**
- Dashboard showing real metrics
- DAG list with working filters
- Smooth navigation between pages

---

### Phase 4: DAG Detail & Error Logs

**Tasks:**
1. **DAG Detail page** (40 min):
   - Fetch DAG info and recent runs
   - Display header with metadata
   - Show runs table (last 20)
   - Calculate and show statistics
   - Format dates and durations nicely

2. **Error Logs page** (20 min):
   - Fetch event logs
   - Display in table with pagination
   - Add DAG filter dropdown
   - Truncate long error messages

**Deliverables:**
- Fully functional DAG detail view
- Error logs page with filters
- All data displaying correctly

---

### Phase 5: Polish & Responsive Design

**Tasks:**
1. **Mobile responsiveness**:
   - Test on mobile viewport
   - Adjust table layouts (horizontal scroll or cards)
   - Ensure navigation works on small screens
   - (20 min)

2. **Loading & empty states**:
   - Add skeletons/spinners everywhere needed
   - Create empty state messages
   - (10 min)

3. **Error handling**:
   - Graceful degradation when API fails
   - User-friendly error messages
   - Retry mechanisms
   - (10 min)

4. **Code cleanup**:
   - Remove console.logs
   - Add comments
   - Check for any hardcoded values
   - (5 min)

**Deliverables:**
- Works perfectly on mobile
- Graceful error handling
- Professional polish

---

### Phase 6: Deployment

**Tasks:**
1. Create GitHub repository
2. Push code: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Airflow monitoring dashboard"
   git remote add origin [your-repo-url]
   git push -u origin main
   ```
3. Connect to Netlify:
   - Go to Netlify dashboard
   - "New site from Git"
   - Select your repo
   - Configure build: `npm run build`, publish: `dist`
4. Add environment variables in Netlify
5. Trigger deploy
6. Test deployed site

**Deliverables:**
- Live site at Netlify URL
- Auto-deploy on git push configured
- Everything working in production

---

## ✅ Testing Checklist

Before considering the project complete, verify:

**Functionality:**
- [ ] Dashboard loads and displays accurate metrics
- [ ] DAG list shows all DAGs from Airflow
- [ ] Search and filters work on DAG list
- [ ] Clicking a DAG navigates to detail page
- [ ] DAG detail shows runs and statistics
- [ ] Error logs page displays recent failures
- [ ] All dates/times formatted properly
- [ ] Status badges show correct colors

**Security:**
- [ ] No API tokens visible in browser DevTools
- [ ] No API tokens in Network tab
- [ ] No API tokens in git history
- [ ] All API calls go through Netlify Functions

**UX:**
- [ ] Loading spinners show during API calls
- [ ] Error messages appear when API fails
- [ ] Empty states show when no data
- [ ] Site works on mobile (test responsive)
- [ ] Navigation is intuitive
- [ ] All links work

**Deployment:**
- [ ] Site deployed successfully to Netlify
- [ ] Environment variables set correctly
- [ ] Auto-deploy works (test with a commit)
- [ ] No build errors or warnings

---

## 📝 Documentation Requirements

### README.md

Create a comprehensive README with:

```markdown
# 🚀 Airflow Monitoring Dashboard

Modern web dashboard for monitoring Apache Airflow DAGs via Astronomer Cloud.

## Features

- 📊 Real-time DAG execution monitoring
- 📈 Success/failure statistics
- 🔍 Error and warning log viewer
- 📱 Responsive design (mobile-friendly)
- 🔒 Secure API proxy (no exposed credentials)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Netlify Functions
- **Deployment**: Netlify + GitHub
- **Monitoring**: Astronomer Airflow Cloud

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Astronomer Airflow account with API access
- Netlify account (free tier works)

### Local Development

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd airflow-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Astronomer credentials
   ```

4. **Run locally**
   ```bash
   netlify dev
   # Opens at http://localhost:8888
   ```

### Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Add environment variables in Netlify**
   - Go to Site settings > Environment variables
   - Add:
    - `AIRFLOW_API_BASE_URL`: Your Astronomer workspace URL (no `/api/v*`)
    - `AIRFLOW_API_VERSION`: Optional API version (defaults to `2`)
     - `AIRFLOW_API_TOKEN`: Your read-only API token

4. **Deploy!**
   - Netlify will auto-deploy on every push

## Security

- ✅ API credentials stored securely in Netlify environment variables
- ✅ All Airflow API calls proxied through Netlify Functions
- ✅ No credentials exposed to client-side code
- ✅ Read-only API token (no write/trigger permissions)

## Project Structure

```
airflow-dashboard/
├── netlify/functions/    # Serverless API proxy
├── src/
│   ├── components/       # React components
│   ├── utils/           # API client and helpers
│   └── App.jsx          # Main app
└── public/              # Static assets
```

## License

MIT License - Training/Internal Use

## Author

Created as a training project for learning AI coding agents.
```

---

## 🎓 Learning Notes

This project is designed to teach:

1. **API Integration**: Working with REST APIs, authentication, CORS
2. **Serverless Architecture**: Netlify Functions as backend
3. **Security Best Practices**: Environment variables, API proxying
4. **Modern React Patterns**: Hooks, async state management
5. **Responsive Design**: Mobile-first approach with Tailwind
6. **CI/CD**: Git → GitHub → Netlify auto-deploy pipeline
7. **AI Pair Programming**: Using Claude Code/Codex effectively

---

## 💡 Tips for AI Agent

**General Guidance:**
- Start simple, add complexity gradually
- Write clean, commented code
- Handle errors gracefully
- Test as you build
- Commit frequently with clear messages

**Common Pitfalls to Avoid:**
- ❌ Don't call Airflow API from frontend directly
- ❌ Don't commit `.env` files
- ❌ Don't ignore loading states
- ❌ Don't hardcode URLs or tokens
- ❌ Don't over-engineer (keep MVP scope)

**When Stuck:**
- Check Airflow API docs
- Test endpoints with curl
- Use browser DevTools Network tab
- Check Netlify Function logs
- Console.log liberally during development

**Code Quality:**
- Use TypeScript if comfortable (optional)
- Add JSDoc comments for complex functions
- Extract reusable logic into utilities
- Keep components small and focused
- Follow React best practices

---

## 🎯 Success Definition

The project is **COMPLETE** when:

✅ A user can visit the deployed site  
✅ View all their Airflow DAGs at a glance  
✅ Click into any DAG and see its run history  
✅ View recent errors and warnings  
✅ All of this works on mobile  
✅ No security tokens are exposed  
✅ Total implementation time ≤ 5 hours  

---

## 📞 Support

If you encounter issues:

1. Check Netlify Function logs
2. Verify environment variables are set
3. Test Airflow API directly with curl
4. Check browser console for errors
5. Review Netlify deployment logs

**Astronomer Support:** https://support.astronomer.io  
**Netlify Docs:** https://docs.netlify.com  
**Airflow API Docs:** https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html

---

**Ready to build! 🚀**

Provide this brief to Claude Code or OpenAI Codex and start coding!

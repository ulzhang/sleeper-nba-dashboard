# Sleeper NBA Fantasy Dashboard

A modern, interactive dashboard for viewing and analyzing your Sleeper NBA fantasy league data, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- League overview and statistics
- Team standings and performance metrics
- Recent matchups and scores
- Real-time data from Sleeper API
- Responsive design for all devices

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Sleeper league ID:
   ```
   NEXT_PUBLIC_SLEEPER_LEAGUE_ID=your_league_id_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Chart.js
- Axios
- Hero Icons

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   └── ui/          # Reusable UI components
├── lib/             # Utility functions and API calls
└── types/           # TypeScript type definitions
```

## Contributing

Feel free to open issues and pull requests for any improvements you'd like to add!

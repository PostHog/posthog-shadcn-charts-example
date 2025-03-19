# PostHog Tremor Visualization Example

This project demonstrates how to visualize PostHog analytics data using the Tremor charting library and Next.js. It provides a user-friendly interface to connect to your PostHog instance, fetch insights, and display them as interactive charts.

## Features

- Connect to PostHog US or EU instances
- Browse and select projects
- View available insights
- Visualize insights as line or bar charts
- Interactive charts with tooltips and legends
- Debug mode for troubleshooting data transformation issues

## Prerequisites

- Node.js 18.x or higher
- pnpm, npm, or yarn
- A PostHog account with a personal API key

## Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/posthog-tremor-example.git
cd posthog-tremor-example
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Start the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

## Usage

1. Obtain a Personal API Key from your PostHog instance:
   - Go to your PostHog instance
   - Navigate to Settings > Personal API Keys
   - Create a new API key with appropriate permissions

2. In the application:
   - Enter your API key and select your region (US or EU)
   - Select a project from the dropdown
   - Choose an insight to visualize
   - View the chart and switch between line and bar visualization

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tremor](https://www.tremor.so/) - React components for data visualization
- [Recharts](https://recharts.org/) - Composable charting library
- [ShadcnUI](https://ui.shadcn.com/) - UI component library
- [PostHog API](https://posthog.com/docs/api) - Analytics data source

## Customization

You can extend this example by:
- Adding more chart types (pie charts, area charts, etc.)
- Implementing dashboard features to display multiple insights
- Creating custom visualizations for specific insight types
- Adding filters for date ranges or user segments

## Troubleshooting

If you encounter issues with data transformation:
1. Check if the insight type is supported (TRENDS, FUNNELS, LIFECYCLE, etc.)
2. Verify that the insight has the expected data structure
3. Try a different insight or chart type
4. Simple TRENDS insights usually work best with line and bar charts
5. Use the debug mode to inspect raw data

## License

[MIT](LICENSE)

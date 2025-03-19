// PostHog API utilities

// Types
export interface PostHogCredentials {
  apiKey: string;
  region: 'us' | 'eu';
  projectId?: string;
}

export interface PostHogProject {
  id: string;
  name: string;
  uuid: string;
}

export interface PostHogInsight {
  id: string;
  name: string;
  description?: string;
  result: any;
  filters: any;
  created_at: string;
  last_refresh: string;
  type: string;
}

// Function to get the base URL based on region
export function getBaseUrl(region: 'us' | 'eu'): string {
  return region === 'us' 
    ? 'https://us.posthog.com' 
    : 'https://eu.i.posthog.com';
}

// Function to fetch projects from PostHog
export async function fetchProjects(credentials: PostHogCredentials): Promise<PostHogProject[]> {
  const { apiKey, region } = credentials;
  const baseUrl = getBaseUrl(region);
  
  const response = await fetch(
    `${baseUrl}/api/organizations/projects/`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

// Function to fetch insights from PostHog
export async function fetchInsights(credentials: PostHogCredentials): Promise<PostHogInsight[]> {
  const { apiKey, region, projectId } = credentials;
  
  if (!projectId) {
    throw new Error('Project ID is required to fetch insights');
  }
  
  const baseUrl = getBaseUrl(region);
  
  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights/?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

// Function to fetch a specific insight data
export async function fetchInsightData(credentials: PostHogCredentials, insightId: string): Promise<any> {
  const { apiKey, region, projectId } = credentials;
  
  if (!projectId) {
    throw new Error('Project ID is required to fetch insight data');
  }
  
  const baseUrl = getBaseUrl(region);
  
  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights/${insightId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch insight data: ${response.statusText}`);
  }

  return await response.json();
}

// Function to transform PostHog data to chart compatible format (works with Recharts)
export function transformToChartFormat(insight: any, chartType: 'line' | 'bar'): any {
  // Basic validation
  if (!insight) {
    console.log("Transform failed: No insight data provided");
    return [];
  }
  
  if (!insight.result) {
    console.log("Transform failed: No result data in the insight");
    console.log("Insight structure:", Object.keys(insight));
    return [];
  }

  // Determine insight type from filters or query
  let insightType = insight.filters?.insight || 
                   (insight.query?.source?.kind === 'TrendsQuery' ? 'TRENDS' : undefined);
  console.log(`Transforming insight of type: ${insightType}`);
  console.log(`Chart type requested: ${chartType}`);

  // Check result structure
  if (!Array.isArray(insight.result)) {
    console.log("Transform note: Result is not an array but", typeof insight.result);
    
    if (insight.result && typeof insight.result === 'object') {
      console.log("Result object keys:", Object.keys(insight.result));
      
      // Some insights might have result as an object with days property
      if (insight.result.days) {
        console.log("Found alternate result structure with days property");
        // Convert to compatible format
        return transformAlternateFormat(insight.result, chartType);
      }
      
      // If it's an object but doesn't have the expected structure
      console.log("Result structure not recognized as a standard format");
    }
    
    return [];
  }

  console.log(`Result is an array with ${insight.result.length} items`);
  if (insight.result.length > 0) {
    console.log("First item keys:", Object.keys(insight.result[0]));
  }

  // For TRENDS insights
  if (insightType === 'TRENDS') {
    console.log("Processing TRENDS insight");
    try {
      const transformed = transformTrendsInsight(insight.result, chartType);
      console.log(`Transformed TRENDS data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming TRENDS data:", error);
      return [];
    }
  }
  
  // For FUNNELS insights
  if (insightType === 'FUNNELS') {
    console.log("Processing FUNNELS insight");
    try {
      const transformed = transformFunnelInsight(insight.result, chartType);
      console.log(`Transformed FUNNELS data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming FUNNELS data:", error);
      return [];
    }
  }
  
  // For LIFECYCLE insights
  if (insightType === 'LIFECYCLE') {
    console.log("Processing LIFECYCLE insight");
    try {
      const transformed = transformLifecycleInsight(insight.result, chartType);
      console.log(`Transformed LIFECYCLE data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming LIFECYCLE data:", error);
      return [];
    }
  }
  
  // For RETENTION insights
  if (insightType === 'RETENTION') {
    console.log("Processing RETENTION insight");
    try {
      const transformed = transformRetentionInsight(insight.result, chartType);
      console.log(`Transformed RETENTION data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming RETENTION data:", error);
      return [];
    }
  }
  
  // For PATHS insights
  if (insightType === 'PATHS') {
    console.log("Processing PATHS insight");
    try {
      const transformed = transformPathsInsight(insight.result, chartType);
      console.log(`Transformed PATHS data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming PATHS data:", error);
      return [];
    }
  }
  
  // For STICKINESS insights
  if (insightType === 'STICKINESS') {
    console.log("Processing STICKINESS insight");
    try {
      const transformed = transformStickinessInsight(insight.result, chartType);
      console.log(`Transformed STICKINESS data: ${transformed.length} points`);
      return transformed;
    } catch (error) {
      console.error("Error transforming STICKINESS data:", error);
      return [];
    }
  }

  // Fallback: Try generic transformation for any array results
  console.log("Using generic transformation for unknown insight type");
  try {
    const transformed = transformGenericInsight(insight.result, chartType);
    console.log(`Transformed generic data: ${transformed.length} points`);
    return transformed;
  } catch (error) {
    console.error("Error in generic transformation:", error);
    return [];
  }
}

// Helper function to transform Trends-type insights
function transformTrendsInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    console.log("Beginning TRENDS transformation");
    
    // Check for the specific format we've observed in the logs
    if (result.length > 0 && result[0].data && result[0].labels) {
      console.log("Found TRENDS data with data and labels arrays");
      
      const firstSeries = result[0];
      const seriesName = firstSeries.label || firstSeries.action?.name || 'Value';
      
      // Validate data and labels arrays
      if (Array.isArray(firstSeries.data) && Array.isArray(firstSeries.labels)) {
        console.log(`Processing ${firstSeries.labels.length} data points for series: ${seriesName}`);
        
        // Map each label/data pair to a data point
        const transformedData = firstSeries.labels.map((label: string, index: number) => {
          return {
            date: label,
            [seriesName]: index < firstSeries.data.length ? firstSeries.data[index] : 0
          };
        });
        
        console.log(`Successfully transformed ${transformedData.length} data points for TRENDS`);
        return transformedData;
      }
    }
    
    // If the format doesn't match what we're checking for above, fall back to the original logic
    // Create a mapping of dates to data points
    const dateMap: Record<string, Record<string, any>> = {};
    
    // Process each series
    result.forEach((series: any, idx: number) => {
      // Skip series with no data
      if (!series.data || !Array.isArray(series.data)) {
        console.log(`Skipping series ${idx} - missing data array`);
        return;
      }
      
      // Extract the series name
      const seriesName = series.label || series.action?.name || `Series ${idx + 1}`;
      console.log(`Processing series: ${seriesName} (${series.data.length} data points)`);
      
      // Determine what to use for x-axis labels
      const xLabels = series.labels || series.days || [];
      
      // Process each data point in the series
      xLabels.forEach((label: string, index: number) => {
        if (index >= series.data.length) {
          console.log(`Skip data point - index out of bounds: ${index} >= ${series.data.length}`);
          return;
        }
        
        // Initialize the date entry if it doesn't exist
        if (!dateMap[label]) {
          dateMap[label] = { date: label };
        }
        
        // Add the value for this series to the date entry
        dateMap[label][seriesName] = series.data[index];
      });
    });
    
    // Convert the map to an array of data points
    const resultData = Object.values(dateMap);
    
    // Only sort if we have valid date strings
    if (resultData.length > 0 && typeof resultData[0].date === 'string') {
      // Sort by date if possible
      resultData.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
    }
    
    console.log(`Transformed to ${resultData.length} data points`);
    return resultData;
  } catch (error) {
    console.error("Error in transformTrendsInsight:", error);
    return [];
  }
}

// Helper function to transform Funnel-type insights
function transformFunnelInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    // For funnels, create a simple array of steps and conversion rates
    const transformedData = result.map((step, index) => {
      const stepName = step.name || `Step ${index + 1}`;
      return {
        date: stepName, // using date as step name for x-axis
        count: step.count || 0,
        conversion_rate: step.conversion_rate || 0,
      };
    });
    
    console.log(`Transformed funnel with ${transformedData.length} steps`);
    return transformedData;
  } catch (error) {
    console.error("Error in transformFunnelInsight:", error);
    return [];
  }
}

// Helper function to transform Lifecycle-type insights
function transformLifecycleInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    // For lifecycle, create a data point for each day with categories
    const dateMap: Record<string, Record<string, any>> = {};
    
    result.forEach((series: any) => {
      const status = series.status || 'unknown';
      
      if (series.data && Array.isArray(series.data) && series.days && Array.isArray(series.days)) {
        series.days.forEach((date: string, index: number) => {
          if (!dateMap[date]) {
            dateMap[date] = { date };
          }
          
          dateMap[date][status] = series.data[index];
        });
      }
    });
    
    const resultData = Object.values(dateMap);
    console.log(`Transformed lifecycle with ${resultData.length} data points`);
    return resultData.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error in transformLifecycleInsight:", error);
    return [];
  }
}

// Helper function to transform Retention-type insights
function transformRetentionInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    // For retention, create a data point for each cohort
    return result.map((cohort, index) => {
      const cohortData: Record<string, any> = { 
        date: cohort.date || `Cohort ${index + 1}`,
      };
      
      // Add retention rates for each period
      if (cohort.values && Array.isArray(cohort.values)) {
        cohort.values.forEach((value: number, periodIndex: number) => {
          cohortData[`Period ${periodIndex}`] = value;
        });
      }
      
      return cohortData;
    });
  } catch (error) {
    console.error("Error in transformRetentionInsight:", error);
    return [];
  }
}

// Helper function to transform Paths-type insights
function transformPathsInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  // Paths insight is complex and might not be suitable for simple line/bar charts
  console.log("Paths insights are not compatible with line or bar charts");
  return [];
}

// Helper function to transform Stickiness-type insights
function transformStickinessInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    // For stickiness, create a data point for each series
    const dateMap: Record<string, Record<string, any>> = {};
    
    result.forEach((series: any, idx: number) => {
      const seriesName = series.label || `Series ${idx + 1}`;
      
      if (series.data && Array.isArray(series.data) && series.labels && Array.isArray(series.labels)) {
        series.labels.forEach((label: string, index: number) => {
          if (!dateMap[label]) {
            dateMap[label] = { date: label };
          }
          
          dateMap[label][seriesName] = series.data[index];
        });
      }
    });
    
    const resultData = Object.values(dateMap);
    return resultData;
  } catch (error) {
    console.error("Error in transformStickinessInsight:", error);
    return [];
  }
}

// Helper function to handle alternate data formats
function transformAlternateFormat(result: any, chartType: 'line' | 'bar'): any[] {
  try {
    // For data with a simple structure like { days: [...], data: [...] }
    if (result.days && Array.isArray(result.days) && result.data && Array.isArray(result.data)) {
      return result.days.map((day: string, index: number) => ({
        date: day,
        value: index < result.data.length ? result.data[index] : 0
      }));
    }
    
    console.log("Alternate format not recognized");
    return [];
  } catch (error) {
    console.error("Error in transformAlternateFormat:", error);
    return [];
  }
}

// Generic transformation for unknown formats
function transformGenericInsight(result: any[], chartType: 'line' | 'bar'): any[] {
  try {
    // Check if result items have a standard-ish structure we can use
    if (result.length > 0) {
      const firstItem = result[0];
      
      // Check for time series with data and labels arrays (common in PostHog)
      if (firstItem.data && Array.isArray(firstItem.data) && 
          (firstItem.labels && Array.isArray(firstItem.labels))) {
        console.log("Detected time series data with labels in generic transformation");
        
        const seriesName = firstItem.label || 'Value';
        return firstItem.labels.map((label: string, index: number) => ({
          date: label,
          [seriesName]: index < firstItem.data.length ? firstItem.data[index] : 0
        }));
      }
      
      // Check for common patterns
      if (firstItem.count !== undefined) {
        // Items with count property
        return result.map((item, index) => ({
          date: item.name || item.label || `Item ${index + 1}`,
          count: item.count || 0
        }));
      } else if (firstItem.value !== undefined) {
        // Items with value property
        return result.map((item, index) => ({
          date: item.name || item.label || `Item ${index + 1}`,
          value: item.value || 0
        }));
      } else if (firstItem.data && Array.isArray(firstItem.data)) {
        // Try to handle series data
        const seriesData: Record<string, Record<string, any>> = {};
        
        result.forEach((series: any, idx: number) => {
          const seriesName = series.name || series.label || `Series ${idx + 1}`;
          
          // Check if we have days/dates or some other x-axis value
          const xValues = series.days || series.dates || series.labels || [];
          const yValues = series.data || [];
          
          xValues.forEach((x: string, index: number) => {
            if (!seriesData[x]) {
              seriesData[x] = { date: x };
            }
            
            if (index < yValues.length) {
              seriesData[x][seriesName] = yValues[index];
            }
          });
        });
        
        return Object.values(seriesData);
      }
    }
    
    console.log("Could not extract chart data from generic format");
    return [];
  } catch (error) {
    console.error("Error in transformGenericInsight:", error);
    return [];
  }
}

// Keep the old function name for backward compatibility
export function transformToTremorFormat(insight: any, chartType: 'line' | 'bar'): any {
  return transformToChartFormat(insight, chartType);
} 
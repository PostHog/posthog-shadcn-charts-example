'use server';

import { 
  PostHogCredentials,
  PostHogProject,
  PostHogInsight 
} from './posthog';

// Function to get the base URL based on region
function getBaseUrl(region: 'us' | 'eu'): string {
  return region === 'us' 
    ? 'https://us.posthog.com' 
    : 'https://eu.i.posthog.com';
}

// Server action to fetch projects from PostHog
export async function fetchProjectsAction(credentials: PostHogCredentials): Promise<PostHogProject[]> {
  const { apiKey, region } = credentials;
  const baseUrl = getBaseUrl(region);
  
  // PostHog API endpoint for listing all projects the user has access to
  const endpoint = `${baseUrl}/api/projects/`;
  console.log(`Fetching projects from ${endpoint}`);
  
  try {
    const response = await fetch(
      endpoint,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostHog API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch projects: ${response.statusText || 'API Error'}`);
    }

    const data = await response.json();
    console.log('Projects response:', data);
    return data.results || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// Server action to fetch insights from PostHog
export async function fetchInsightsAction(credentials: PostHogCredentials): Promise<PostHogInsight[]> {
  const { apiKey, region, projectId } = credentials;
  
  if (!projectId) {
    throw new Error('Project ID is required to fetch insights');
  }
  
  const baseUrl = getBaseUrl(region);
  console.log(`Fetching insights from ${baseUrl}/api/projects/${projectId}/insights/`);
  
  try {
    const response = await fetch(
      `${baseUrl}/api/projects/${projectId}/insights/?limit=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostHog API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch insights: ${response.statusText || 'API Error'}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
}

// Server action to fetch a specific insight data
export async function fetchInsightDataAction(credentials: PostHogCredentials, insightId: string): Promise<any> {
  const { apiKey, region, projectId } = credentials;
  
  if (!projectId) {
    throw new Error('Project ID is required to fetch insight data');
  }
  
  const baseUrl = getBaseUrl(region);
  console.log(`Fetching insight data from ${baseUrl}/api/projects/${projectId}/insights/${insightId}`);
  
  try {
    const response = await fetch(
      `${baseUrl}/api/projects/${projectId}/insights/${insightId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostHog API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch insight data: ${response.statusText || 'API Error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insight data:', error);
    throw error;
  }
} 
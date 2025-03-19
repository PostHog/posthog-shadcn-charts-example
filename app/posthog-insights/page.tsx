"use client";

import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { 
  type PostHogCredentials, 
  type PostHogInsight,
  type PostHogProject,
  transformToChartFormat 
} from "@/lib/posthog";

import {
  fetchProjectsAction,
  fetchInsightsAction,
  fetchInsightDataAction
} from "@/lib/actions";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PostHogInsightsPage() {
  // State for PostHog credentials
  const [credentials, setCredentials] = useState<PostHogCredentials>({
    apiKey: "",
    region: "us",
  });

  // State for projects
  const [projects, setProjects] = useState<PostHogProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // State for insights
  const [insights, setInsights] = useState<PostHogInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<PostHogInsight[]>([]);
  const [selectedInsightId, setSelectedInsightId] = useState<string>("");
  const [insightSearchQuery, setInsightSearchQuery] = useState<string>("");
  const [selectedChartType, setSelectedChartType] = useState<"line" | "bar">("line");
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for chart data
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartCategories, setChartCategories] = useState<string[]>([]);

  // Add a new state variable to store raw insight data for debugging
  const [rawInsightData, setRawInsightData] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  // Add state for UI components
  const [insightComboboxOpen, setInsightComboboxOpen] = useState(false);

  // Filter insights when search query changes
  useEffect(() => {
    if (insights.length > 0) {
      const filtered = insightSearchQuery 
        ? insights.filter(insight => 
            insight.name.toLowerCase().includes(insightSearchQuery.toLowerCase()) ||
            (insight.description && insight.description.toLowerCase().includes(insightSearchQuery.toLowerCase()))
          )
        : insights;
      
      setFilteredInsights(filtered);
    }
  }, [insightSearchQuery, insights]);

  // Reset project and insight selection when region changes
  useEffect(() => {
    setProjects([]);
    setSelectedProjectId("");
    setInsights([]);
    setSelectedInsightId("");
    setChartData([]);
    setChartCategories([]);
  }, [credentials.region]);

  // Reset insight selection when project changes
  useEffect(() => {
    setInsights([]);
    setSelectedInsightId("");
    setChartData([]);
    setChartCategories([]);
  }, [selectedProjectId]);

  // Handler for fetching projects
  const handleFetchProjects = async () => {
    if (!credentials.apiKey) {
      setError("Please enter your API Key");
      return;
    }

    setIsLoadingProjects(true);
    setError(null);

    try {
      const fetchedProjects = await fetchProjectsAction(credentials);
      
      if (fetchedProjects.length === 0) {
        setError("No projects found. Please check your API key and ensure you have access to projects.");
      } else {
        setProjects(fetchedProjects);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(`Error fetching projects: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Handler for fetching insights
  const handleFetchInsights = async () => {
    if (!selectedProjectId) {
      setError("Please select a project");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCredentials = {
        ...credentials,
        projectId: selectedProjectId,
      };

      const fetchedInsights = await fetchInsightsAction(updatedCredentials);
      
      if (fetchedInsights.length === 0) {
        setError("No insights found in this project. Please create insights in PostHog first.");
      } else {
        setInsights(fetchedInsights);
        setFilteredInsights(fetchedInsights);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(`Error fetching insights: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for fetching insight data
  const handleFetchInsightData = async () => {
    if (!selectedInsightId) {
      setError("Please select an insight");
      return;
    }

    setIsLoading(true);
    setError(null);
    setChartData([]);
    setChartCategories([]);
    setRawInsightData(null);

    try {
      const updatedCredentials = {
        ...credentials,
        projectId: selectedProjectId,
      };

      const insightData = await fetchInsightDataAction(updatedCredentials, selectedInsightId);
      
      // Store raw data for debugging
      setRawInsightData(insightData);
      
      // Log the raw insight data structure to help with debugging
      console.log("Raw insight data:", JSON.stringify(insightData, null, 2));
      console.log("Insight type:", insightData.filters?.insight);
      console.log("Result structure:", insightData.result ? typeof insightData.result : "No result");
      
      // Store raw data for display in case of transformation error
      const rawDataSample = JSON.stringify(insightData, null, 2).slice(0, 2000) + "...";
      
      if (insightData.result && Array.isArray(insightData.result)) {
        console.log("Result is an array with", insightData.result.length, "items");
        if (insightData.result.length > 0) {
          console.log("First result item sample:", JSON.stringify(insightData.result[0], null, 2));
        }
      }
      
      try {
        const transformedData = transformToChartFormat(insightData, selectedChartType);
        
        // Log the transformed data
        console.log("Transformed data:", transformedData.length > 0 ? JSON.stringify(transformedData.slice(0, 2), null, 2) : "Empty");
        
        if (transformedData.length === 0) {
          setError(`Could not transform the data for the selected chart type. The insight type "${insightData.filters?.insight || 'unknown'}" may not be compatible with this visualization.`);
          return;
        }

        setChartData(transformedData);
        
        // Extract categories (series names) from the first data point
        if (transformedData.length > 0) {
          const firstDataPoint = transformedData[0];
          const categories = Object.keys(firstDataPoint).filter(key => key !== "date");
          setChartCategories(categories);
          console.log("Chart categories:", categories);
        }
        
        setError(null);
      } catch (transformError) {
        console.error("Transformation error:", transformError);
        setError(`Error transforming data: ${transformError instanceof Error ? transformError.message : String(transformError)}`);
      }
    } catch (err) {
      console.error("Error fetching insight data:", err);
      setError(`Error fetching insight data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create chart config from categories
  const chartConfig = chartCategories.reduce((config, category, index) => {
    const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    return {
      ...config,
      [category]: {
        label: category,
        color: colors[index % colors.length],
      },
    };
  }, {});

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">PostHog Insights Visualization</h1>
      <p className="text-gray-500 mb-4">Connect to your PostHog instance and visualize insights</p>
      
      <Alert className="mb-6">
        <AlertTitle>Using PostHog API</AlertTitle>
        <AlertDescription>
          This application uses PostHog API to fetch and visualize your insights. You need a Personal API Key from PostHog to proceed.
          You can create one by going to your PostHog instance &gt; Settings &gt; Personal API Keys.
        </AlertDescription>
      </Alert>
      
      {/* Step 1: Enter API Key and Region */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Connect to PostHog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Region</label>
              <Select
                value={credentials.region}
                onValueChange={(value) => setCredentials({ ...credentials, region: value as 'us' | 'eu' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">US (us.posthog.com)</SelectItem>
                  <SelectItem value="eu">EU (eu.i.posthog.com)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Personal API Key</label>
              <Input
                placeholder="ph_XXXXXXXXXXXX"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleFetchProjects}
            disabled={!credentials.apiKey || isLoadingProjects}
          >
            {isLoadingProjects ? "Loading..." : "Connect & Fetch Projects"}
          </Button>
        </CardFooter>
        
        {error && (
          <div className="px-6 pb-6">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </Card>
      
      {/* Step 2: Select Project */}
      {projects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleFetchInsights}
              disabled={!selectedProjectId || isLoading}
            >
              {isLoading ? "Loading..." : "Fetch Insights"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 3: Select Insight and Chart Type */}
      {insights.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: Select Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select an Insight</label>
                <Select
                  value={selectedInsightId}
                  onValueChange={setSelectedInsightId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an insight..." />
                  </SelectTrigger>
                  <SelectContent>
                    {insights.map((insight) => (
                      <SelectItem key={insight.id} value={insight.id}>
                        {insight.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleFetchInsightData}
              disabled={!selectedInsightId || isLoading}
            >
              {isLoading ? "Loading..." : "Fetch Chart Data"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Chart Rendering */}
      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Chart Visualization</CardTitle>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-2">Chart Type</label>
              <Tabs 
                defaultValue="line" 
                value={selectedChartType}
                onValueChange={(value) => setSelectedChartType(value as "line" | "bar")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="line">Line Chart</TabsTrigger>
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72" config={chartConfig}>
              {selectedChartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chartCategories.map((category, index) => (
                    <Line 
                      key={category}
                      dataKey={category}
                      stroke={`hsl(var(--chart-${index + 1}))`}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chartCategories.map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      fill={`hsl(var(--chart-${index + 1}))`}
                    />
                  ))}
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      
      {/* No Data Card */}
      {insights.length > 0 && selectedInsightId && chartData.length === 0 && !isLoading && !error && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No data to display. Fetch insight data first.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Debug Section - Only shown when there's an error and no chart data */}
      {error && error.includes("transform") && chartData.length === 0 && (
        <Card className="mt-4 border-dashed border-amber-500">
          <CardHeader>
            <CardTitle className="text-amber-500">Debug Information</CardTitle>
            <CardDescription>
              The data for the selected chart type could not be transformed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <p className="font-medium mb-2">Open the browser console to see detailed logs of the transformation process.</p>
              <p className="text-sm mb-4">Press F12 to open developer tools, then go to the Console tab.</p>
              
              <h3 className="font-medium mt-4 mb-2">Troubleshooting Tips:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Check if the insight type is supported (TRENDS, FUNNELS, LIFECYCLE, etc.)</li>
                <li>Verify that the insight has the expected data structure</li>
                <li>Try a different insight or chart type</li>
                <li>Simple TRENDS insights usually work best with line and bar charts</li>
              </ul>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleFetchInsightData()}
                  variant="outline"
                >
                  Retry Transformation
                </Button>
                
                <Button
                  onClick={() => setShowRawData(!showRawData)}
                  variant="secondary"
                >
                  {showRawData ? "Hide Raw Data" : "Show Raw Data"}
                </Button>
              </div>
              
              {showRawData && rawInsightData && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Raw Insight Data</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-60 text-xs">
                    <div>
                      <strong>Insight Type:</strong> {rawInsightData.filters?.insight || "Unknown"}
                    </div>
                    <div>
                      <strong>Result Type:</strong> {rawInsightData.result ? (Array.isArray(rawInsightData.result) ? `Array with ${rawInsightData.result.length} items` : typeof rawInsightData.result) : "No result"}
                    </div>
                    {rawInsightData.result && Array.isArray(rawInsightData.result) && rawInsightData.result.length > 0 && (
                      <div className="mt-2">
                        <strong>First Item Sample:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {JSON.stringify(rawInsightData.result[0], null, 2)}
                        </pre>
                      </div>
                    )}
                    {rawInsightData.result && !Array.isArray(rawInsightData.result) && typeof rawInsightData.result === 'object' && (
                      <div className="mt-2">
                        <strong>Result keys:</strong> {Object.keys(rawInsightData.result).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
} 
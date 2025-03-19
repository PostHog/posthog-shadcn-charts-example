import Image from "next/image";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-10">
      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-center">PostHog Insights with Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <p className="text-lg text-center">
              Visualize your PostHog analytics data with beautiful charts in NextJS 14
            </p>
            
            <div className="flex justify-center mt-6">
              <Link href="/posthog-insights">
                <Button size="lg">
                  View PostHog Insights
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</div>
              <p>Navigate to the PostHog Insights page</p>
            </li>
            <li className="flex gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</div>
              <p>Enter your PostHog API Key and Project ID</p>
            </li>
            <li className="flex gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">3</div>
              <p>Select an insight from your project</p>
            </li>
            <li className="flex gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">4</div>
              <p>Choose a chart type (Line or Bar)</p>
            </li>
            <li className="flex gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">5</div>
              <p>View your data visualized with beautiful charts</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

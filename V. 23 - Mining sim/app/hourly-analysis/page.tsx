import { redirect } from "next/navigation"

export default function HourlyAnalysisPage() {
  // Redirect to the main page since hourly analysis is now the landing page
  redirect("/")
}


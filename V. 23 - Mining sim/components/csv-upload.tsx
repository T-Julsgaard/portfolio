"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, Check, Download, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

interface EnergyData {
  timestamp: string
  energy: number
}

interface FileUploadProps {
  onDataUploaded: (data: EnergyData[]) => void
}

export default function FileUpload({ onDataUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileData, setFileData] = useState<EnergyData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [previewPage, setPreviewPage] = useState(0)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    // Check if file is CSV or Excel
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv")
    const isExcel =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")

    if (!isCSV && !isExcel) {
      setError("Please upload a CSV or Excel (.xlsx) file.")
      return
    }

    setPreviewPage(0)
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    if (isCSV) {
      processCSVFile(file)
    } else {
      processExcelFile(file)
    }
  }

  const processCSVFile = (file: File) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(progress)
      }
    }

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const result = parseCSV(text)

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setFileData(result.data)
          onDataUploaded(result.data)
          toast({
            title: "CSV uploaded successfully",
            description: `Loaded ${result.data.length} hourly energy records.`,
          })
        }
      } catch (err) {
        setError("Failed to parse CSV file. Please check the format.")
        console.error(err)
      } finally {
        setIsUploading(false)
        setUploadProgress(100)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }

    reader.onerror = () => {
      setError("Error reading file. Please try again.")
      setIsUploading(false)
    }

    reader.readAsText(file)
  }

  const processExcelFile = (file: File) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(progress)
      }
    }

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Process the Excel data
        const result = parseExcelData(jsonData)

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setFileData(result.data)
          onDataUploaded(result.data)
          toast({
            title: "Excel file uploaded successfully",
            description: `Loaded ${result.data.length} hourly energy records.`,
          })
        }
      } catch (err) {
        setError("Failed to parse Excel file. Please check the format.")
        console.error(err)
      } finally {
        setIsUploading(false)
        setUploadProgress(100)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }

    reader.onerror = () => {
      setError("Error reading file. Please try again.")
      setIsUploading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const parseExcelData = (jsonData: any[]): { data?: EnergyData[]; error?: string } => {
    if (!jsonData || jsonData.length === 0) {
      return { error: "Excel file is empty or has no data." }
    }

    // Check if the data has the required columns
    const firstRow = jsonData[0]
    const columns = Object.keys(firstRow)

    if (columns.length < 2) {
      return { error: "Excel file must have at least 2 columns: timestamp and energy value." }
    }

    // Try to identify the timestamp and energy columns
    let timeColumn = columns.find(
      (col) =>
        col.toLowerCase().includes("time") ||
        col.toLowerCase().includes("date") ||
        col.toLowerCase().includes("period"),
    )

    let energyColumn = columns.find(
      (col) =>
        col.toLowerCase().includes("energy") ||
        col.toLowerCase().includes("power") ||
        col.toLowerCase().includes("kwh") ||
        col.toLowerCase().includes("export"),
    )

    // If we couldn't identify the columns, use the first two
    if (!timeColumn) timeColumn = columns[0]
    if (!energyColumn) energyColumn = columns[1]

    // Parse the data
    const data: EnergyData[] = []

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      const timestamp = row[timeColumn]
      const energy = Number.parseFloat(row[energyColumn])

      // Skip rows with missing data
      if (!timestamp || isNaN(energy)) continue

      // Convert Excel date numbers to date strings if needed
      let timestampStr = timestamp
      if (typeof timestamp === "number") {
        // Excel stores dates as days since 1900-01-01
        const date = XLSX.SSF.parse_date_code(timestamp)
        timestampStr = `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")} ${String(date.H).padStart(2, "0")}:${String(date.M).padStart(2, "0")}:${String(date.S).padStart(2, "0")}`
      }

      data.push({
        timestamp: String(timestampStr),
        energy,
      })
    }

    if (data.length === 0) {
      return { error: "Could not extract valid data from the Excel file." }
    }

    return { data }
  }

  const parseCSV = (text: string): { data?: EnergyData[]; error?: string } => {
    // Split by lines and remove empty lines
    const lines = text.split("\n").filter((line) => line.trim() !== "")

    if (lines.length < 2) {
      return { error: "CSV file must contain at least a header row and one data row." }
    }

    // Check header row
    const header = lines[0].split(",").map((h) => h.trim())
    if (header.length < 2) {
      return { error: "CSV must have at least 2 columns: timestamp and energy value." }
    }

    // Parse data rows
    const data: EnergyData[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((v) => v.trim())

      if (values.length < 2) {
        continue // Skip rows with insufficient columns
      }

      const timestamp = values[0]
      const energy = Number.parseFloat(values[1])

      // Skip rows with invalid energy values
      if (isNaN(energy)) continue

      data.push({ timestamp, energy })
    }

    if (data.length === 0) {
      return { error: "Could not extract valid data from the CSV file." }
    }

    return { data }
  }

  const downloadTemplate = () => {
    // Create workbook with both CSV and Excel templates
    const wb = XLSX.utils.book_new()

    const templateData = [
      ["Time Period", "Exported Energy (kWh)"],
      ["2024-03-06 00:00:00", 0.0],
      ["2024-03-06 01:00:00", 0.0],
      ["2024-03-06 02:00:00", 0.0],
      ["2024-03-06 03:00:00", 5.2],
      ["2024-03-06 04:00:00", 7.8],
      ["2024-03-06 05:00:00", 10.5],
      ["2024-03-06 06:00:00", 15.3],
      ["2024-03-06 07:00:00", 22.1],
      ["2024-03-06 08:00:00", 28.7],
      ["2024-03-06 09:00:00", 32.4],
      ["2024-03-06 10:00:00", 35.9],
      ["2024-03-06 11:00:00", 38.2],
      ["2024-03-06 12:00:00", 39.5],
      ["2024-03-06 13:00:00", 37.8],
      ["2024-03-06 14:00:00", 34.2],
      ["2024-03-06 15:00:00", 29.7],
      ["2024-03-06 16:00:00", 23.5],
      ["2024-03-06 17:00:00", 18.1],
      ["2024-03-06 18:00:00", 12.4],
      ["2024-03-06 19:00:00", 8.2],
      ["2024-03-06 20:00:00", 4.5],
      ["2024-03-06 21:00:00", 2.1],
      ["2024-03-06 22:00:00", 0.8],
      ["2024-03-06 23:00:00", 0.0],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    XLSX.utils.book_append_sheet(wb, ws, "Energy Export Data")

    // Generate Excel file
    XLSX.writeFile(wb, "energy_export_template.xlsx")

    toast({
      title: "Template downloaded",
      description: "Excel template has been downloaded.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Energy Export Data</h2>
          <p className="text-sm text-muted-foreground">
            Upload hourly energy export data for Bitcoin mining profitability analysis
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Upload your data file</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Drag and drop your CSV or Excel (.xlsx) file here, or click to browse. The file should contain hourly
              timestamps and energy export values.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FileText className="h-4 w-4 mr-2" />
              Select CSV File
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Select Excel File
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Uploading...</span>
            <span className="text-sm">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fileData && fileData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Data Preview</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(previewPage * 5 + 1, fileData.length)} to{" "}
              {Math.min((previewPage + 1) * 5, fileData.length)} of {fileData.length} records
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Period</TableHead>
                  <TableHead className="text-right">Exported Energy (kWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileData.slice(previewPage * 5, (previewPage + 1) * 5).map((row, index) => (
                  <TableRow key={previewPage * 5 + index}>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell className="text-right">{row.energy.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Page {previewPage + 1} of {Math.ceil(fileData.length / 5)}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewPage((prev) => Math.max(0, prev - 1))}
                disabled={previewPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewPage((prev) => Math.min(Math.ceil(fileData.length / 5) - 1, prev + 1))}
                disabled={previewPage >= Math.ceil(fileData.length / 5) - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


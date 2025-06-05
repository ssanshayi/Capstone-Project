"use client"

import { useState } from "react"

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string[] | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setMediaUrl(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("https://capstone-project2-x9ax.onrender.com/predict", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data.detections || [])

      if (data.image_url) {
        setMediaUrl(data.image_url)
        setMediaType("image")
      } else if (data.video_url) {
        setMediaUrl(data.video_url)
        setMediaType("video")
      }
    } catch (err) {
      setError("Detection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-center text-cyan-700">AI Species Detection</h1>
      <p className="text-center mb-6 text-gray-600">
        Upload an image or video to detect marine species using our trained YOLOv8 model.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="file:border file:border-gray-300 file:rounded file:px-3 file:py-1 file:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Detecting..." : "Upload & Detect"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-cyan-800">Detected Species:</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {result.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {mediaUrl && mediaType === "image" && (
        <img src={mediaUrl} alt="Result" className="mt-6 w-full rounded shadow" />
      )}

      {mediaUrl && mediaType === "video" && (
        <div className="mt-6">
          <a
            href={mediaUrl}
            download
            className="text-blue-600 underline hover:text-blue-800"
          >
            Click here to download processed video
          </a>
        </div>
      )}
    </div>
  )
}

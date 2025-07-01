"use client"
import { useState, useRef, useEffect } from "react"

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string[] | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [frameCount, setFrameCount] = useState<number | null>(null)
  const [perSecond, setPerSecond] = useState<Record<string, string[]> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const API_BASE = "https://capstone-project2.up.railway.app"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setMediaUrl(null)
    setShowModal(false)
    setFrameCount(null)
    setPerSecond(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(API_BASE + "/predict", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data.detections || [])

      if (data.media_url && data.type) {
        setMediaUrl(API_BASE + data.media_url)
        setMediaType(data.type)
        setFrameCount(data.frames_written || null)
        setPerSecond(data.detections_per_second || null)
        setShowModal(true)
      }
    } catch (err) {
      setError("Detection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false)
      }
    }
    if (showModal) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showModal])

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-center text-cyan-700">AI Species Detection</h1>
      <p className="text-center mb-6 text-gray-600">
        Upload an image or an MP4 video to detect marine species using our YOLOv8 model.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*,video/mp4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="file:border file:border-gray-300 file:rounded file:px-3 file:py-1 file:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (file?.type.includes("video") ? "Processing video..." : "Processing image...") : "Upload & Detect"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-semibold text-center text-cyan-800 mb-4">Detection Results</h2>

            {mediaUrl && mediaType === "image" && (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Detected Image</h3>
                <img src={mediaUrl} alt="Detected result" className="w-full rounded mb-4" />
                <a
                  href={mediaUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
                >
                  Download Detected Image
                </a>
              </>
            )}

            {mediaUrl && mediaType === "video" && (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Detected Video</h3>
                <video src={mediaUrl} controls className="w-full rounded mb-4" />
                <a
                  href={mediaUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
                >
                  Download Detected Video
                </a>
                {frameCount !== null && <p className="text-gray-700 mt-2">Frames written: {frameCount}</p>}
                {perSecond && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Per-second Species</h3>
                    <ul className="list-disc pl-6 text-gray-700 text-sm max-h-48 overflow-y-auto">
                      {Object.entries(perSecond).map(([sec, species]) => (
                        <li key={sec}>
                          <strong>Second {sec}:</strong> {species.length > 0 ? species.join(", ") : "None"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {result && result.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Detected Species</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  {result.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

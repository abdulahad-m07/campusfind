import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createItem, uploadImage } from '../services/api'

function ReportForm() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    type: 'lost',
    itemName: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contact: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const MAX_SIZE = 2 * 1024 * 1024

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const applyFile = (file) => {
    if (file && file.size > MAX_SIZE) {
      window.alert('File is too big. Maximum size is 2 MB.')
      setImageFile(null)
      setImagePreview(null)
      return
    }
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    applyFile(file)
  }

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    applyFile(file)
  }

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }

  const openCamera = async () => {
    setCameraError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 0)
    } catch {
      setCameraError('Could not open camera. You can use "Choose from files" instead.')
      cameraInputRef.current?.click()
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' })
        applyFile(file)
        stopCamera()
      },
      'image/jpeg',
      0.85
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let imageUrl = ''

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        imageUrl = uploadResult.imageUrl
      }

      const newItem = await createItem({ ...formData, imageUrl })
      const newItemId = newItem._id || newItem.id
      navigate(`/item/${newItemId}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>What happened?</label>
        <div className="type-selector">
          <button
            type="button"
            className={formData.type === 'lost' ? 'type-btn active lost' : 'type-btn'}
            onClick={() => setFormData({ ...formData, type: 'lost' })}
          >
            I lost something
          </button>
          <button
            type="button"
            className={formData.type === 'found' ? 'type-btn active found' : 'type-btn'}
            onClick={() => setFormData({ ...formData, type: 'found' })}
          >
            I found something
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="itemName">Item Name *</label>
        <input
          type="text"
          id="itemName"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="e.g. Blue Backpack"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the item — color, brand, any identifying details..."
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Central Library, Room 204"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact">Contact Information *</label>
        <input
          type="text"
          id="contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Email or phone number"
          required
        />
      </div>

      <div className="form-group">
        <label>Photo (optional, max 2 MB)</label>
        <input
          type="file"
          id="camera-input"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
          className="hidden-input"
        />
        <input
          type="file"
          id="gallery-input"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleGalleryChange}
          className="hidden-input"
        />
        <div className="photo-options">
          <button
            type="button"
            className="photo-option-btn"
            onClick={openCamera}
          >
            📷 Take photo
          </button>
          <button
            type="button"
            className="photo-option-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            🖼️ Choose from files
          </button>
        </div>
        {cameraError && <p className="camera-error">{cameraError}</p>}
        {cameraOpen && (
          <div className="camera-preview">
            <video ref={videoRef} playsInline muted className="camera-video" />
            <div className="camera-controls">
              <button
                type="button"
                className="photo-option-btn camera-capture-btn"
                onClick={capturePhoto}
              >
                📸 Capture
              </button>
              <button
                type="button"
                className="photo-option-btn"
                onClick={stopCamera}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
        {imagePreview && (
          <div className="image-preview">
            <button
              type="button"
              className="image-preview-remove"
              aria-label="Remove photo"
              onClick={removeImage}
            >
              ✕
            </button>
            <img src={imagePreview} alt="Selected preview" />
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}

export default ReportForm

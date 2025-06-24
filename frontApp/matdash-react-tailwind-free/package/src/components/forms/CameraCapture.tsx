import { useRef, useState, useEffect, FC } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  label: string;
  isOpen: boolean;
  onClose: () => void;
}

const CameraCapture: FC<CameraCaptureProps> = ({ onCapture, label, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let localStream: MediaStream;

    const startCamera = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
        setStream(localStream);
      } catch (err) {
        console.error('Error accessing camera: ', err);
      }
    };

    if (isOpen) {
      startCamera();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCaptured(false);
      setIsVideoReady(false);
    };
  }, [isOpen]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Video is not ready yet or canvas missing");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to capture image");
        return;
      }

      const fileName = label.replace(/\s+/g, '_').toLowerCase() + '.png';
      const file = new File([blob], fileName, { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      setImageUrl(url);
      onCapture(file);
      setCaptured(true);
    }, 'image/png');
  };

  const handleRetake = () => {
    setCaptured(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="camera-capture transition-opacity duration-300 opacity-100">
      <label className="block mb-1 font-semibold">{label}</label>

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        key={captured ? 'canvas-captured' : 'canvas-empty'}
      />

      {!captured ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={() => {
              setIsVideoReady(true);
              videoRef.current?.play().catch(console.error);
            }}
            className="w-full rounded-md border"
          />
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isVideoReady}
            className={`mt-2 px-4 py-2 rounded text-white ${
              isVideoReady ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Capture
          </button>
        </>
      ) : (
        <>
          {imageUrl && (
            <img src={imageUrl} alt="Captured" className="w-full mt-2 rounded-md border" />
          )}
          <p className="mt-2 text-green-600 font-semibold">Photo captured</p>
          <button
            type="button"
            onClick={handleRetake}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Icon } from "../utils/icons";
import getCroppedImg from "../utils/cropImage";
import useThemeStyles from "../utils/themeStyles";

const FILTER_PRESETS = [
  {
    name: "Normal",
    filters: {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Vintage",
    filters: {
      brightness: 1.1,
      contrast: 1.2,
      saturation: 0.8,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Cool",
    filters: {
      brightness: 1,
      contrast: 1.1,
      saturation: 1.5,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Warm",
    filters: {
      brightness: 1.2,
      contrast: 1.1,
      saturation: 1.2,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Blurred",
    filters: {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 2,
      sharpness: 0,
    },
  },
  {
    name: "Black & White",
    filters: {
      brightness: 1,
      contrast: 1.5,
      saturation: 0,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Brighten",
    filters: {
      brightness: 1.4,
      contrast: 1,
      saturation: 1,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Soft Glow",
    filters: {
      brightness: 1.2,
      contrast: 0.9,
      saturation: 1.1,
      blur: 1,
      sharpness: 0,
    },
  },
  {
    name: "Dark Mood",
    filters: {
      brightness: 0.8,
      contrast: 1.3,
      saturation: 0.9,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "High Contrast",
    filters: {
      brightness: 1,
      contrast: 1.6,
      saturation: 1,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    name: "Dreamy",
    filters: {
      brightness: 1.1,
      contrast: 0.8,
      saturation: 1.2,
      blur: 1.5,
      sharpness: 0,
    },
  },
];

const ImageEditorModal = ({
  theme,
  imageSrc,
  onClose,
  onSave,
  aspect = 1,
  type = "image",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [blur, setBlur] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  const styles = useThemeStyles();

  const onCropComplete = (_, areaPixels) => setCroppedAreaPixels(areaPixels);

  const applyPreset = (preset) => {
    const { brightness, contrast, saturation, blur, sharpness } =
      preset.filters;
    setBrightness(brightness);
    setContrast(contrast);
    setSaturation(saturation);
    setBlur(blur);
    setSharpness(sharpness);
  };

  const handleSave = async () => {
    try {
      if (type === "image") {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, {
          brightness,
          contrast,
          saturation,
          blur,
        });
        if (croppedImage) {
          onSave(croppedImage);
        } else {
          console.error("Failed to crop image");
        }
      } else {
        onSave(imageSrc);
      }
    } catch (error) {
      console.error("Error while processing media:", error);
    }
  };

  const filterStyle = `
    brightness(${brightness})
    contrast(${contrast})
    saturate(${saturation})
    blur(${blur}px)
  `;

  const handlePresetChange = (e) => {
    const selected = FILTER_PRESETS.find((p) => p.name === e.target.value);
    if (selected) applyPreset(selected);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black bg-opacity-70 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div
        className={`flex justify-between items-center p-4 ${styles.bg} border-b`}
      >
        <button onClick={onClose}>
          <Icon.Close size={24} />
        </button>
        <span className={`font-semibold text-lg`}>
          Edit {type === "image" ? "Image" : "Video"}
        </span>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-1 rounded-md"
        >
          Save
        </button>
      </div>

      {/* Media Preview */}
      <div className="flex-1 relative bg-black">
        {type === "image" ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
                background: "#000",
              },
              mediaStyle: { filter: filterStyle },
            }}
          />
        ) : (
          <div className="w-full h-[50%] flex items-center justify-center">
            <video
              src={imageSrc}
              className="max-w-full max-h-full"
              style={{ filter: filterStyle }}
              controls
            />
          </div>
        )}
      </div>

      {/* Filter Presets Dropdown */}
      <div
        className={`${styles.bg2} p-4 flex items-center justify-between border-t`}
      >
        <label className={`text-sm font-medium`}>Select Preset</label>
        <select
          onChange={handlePresetChange}
          className={`px-4 py-2 border rounded-md ${styles.bg}`}
        >
          <option value="">-- Select a Preset --</option>
          {FILTER_PRESETS.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filters Sliders */}
      <div
        className={`${styles.bg2} p-4 flex flex-col space-y-3 overflow-y-auto max-h-[300px]`}
      >
        {type === "image" && (
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium`}>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-2/3"
            />
          </div>
        )}
        {[
          ["Brightness", brightness, setBrightness, 0.5, 1.5, 0.01],
          ["Contrast", contrast, setContrast, 0.5, 1.5, 0.01],
          ["Saturation", saturation, setSaturation, 0, 2, 0.01],
          ["Blur", blur, setBlur, 0, 5, 0.1],
        ].map(([label, val, setter, min, max, step]) => (
          <div key={label} className="flex items-center justify-between">
            <label className={`text-sm font-medium `}>{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => setter(parseFloat(e.target.value))}
              className="w-2/3"
            />
          </div>
        ))}

        {/* Sharpness (disabled) */}
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium`}>
            Sharpness (coming soon)
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={sharpness}
            disabled
            className="w-2/3 opacity-50 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;

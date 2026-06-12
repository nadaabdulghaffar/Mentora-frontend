// --- DEMO ONLY ---
import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";

export interface DemoEditField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number";
}

interface DemoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  title: string;
  initialData: any;
  fields: DemoEditField[];
}

const DemoEditModal = ({ isOpen, onClose, onSave, title, initialData, fields }: DemoEditModalProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData, isOpen]);

  if (!isOpen || !initialData) return null;

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateInk/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-slateInk">
            <Edit className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold font-poppins">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  rows={3}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
            <strong>Demo Mode:</strong> Changes are local only and will be lost upon refresh.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoEditModal;
// --- END DEMO ONLY ---

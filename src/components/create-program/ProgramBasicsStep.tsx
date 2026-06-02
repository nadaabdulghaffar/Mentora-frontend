import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useFormikContext, getIn } from "formik";

import type { CreateProgramFormData } from "./types";
import type { AuthUser } from "../../types/api";

import authService from "../../services/authService";
import lookupAPI from "../../services/lookupService";

import {
  InputGroup,
  SelectField,
  TextAreaField,
  type Option,
} from "../../components/MultiStepForm";

import ExtraProgramCard from "../ExtraProgramCard";

export default function ProgramBasicsStep({ isEditMode = false }: { isEditMode?: boolean }) {
  const { values, setFieldValue, errors } = useFormikContext<CreateProgramFormData>();

  const [domains, setDomains] = useState<Option[]>([]);
  const [subDomains, setSubDomains] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewImage, setPreviewImage] = useState("");
  const [mentor, setMentor] = useState<AuthUser | null>(null);

  const domainId = values.domainId;
  const subDomainId = values.subDomainId;
  const title = values.title;
  const description = values.description;
  const existingImageUrl = values.existingImageUrl;

  /* Load current mentor */
  useEffect(() => {
    const loadMentor = async () => {
      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setMentor(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadMentor();
  }, []);

  /* Load domains */
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const res = await lookupAPI.getDomains();
        if (res.success && res.data) {
          setDomains(
            res.data.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDomains();
  }, []);

  /* Load sub domains */
  useEffect(() => {
    const loadSubDomains = async () => {
      if (!domainId) {
        setSubDomains([]);
        return;
      }

      try {
        const res = await lookupAPI.getSubDomains(String(domainId));
        if (res.success && res.data) {
          setSubDomains(
            res.data.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadSubDomains();
  }, [domainId]);

  useEffect(() => {
    if (existingImageUrl && !previewImage) {
      setPreviewImage(existingImageUrl);
    }
  }, [existingImageUrl, previewImage]);

  /* Upload image */
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFieldValue("image", file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };

  const selectedDomain =
    domains.find(
      (item) => String(item.value) === String(domainId)
    )?.label || "DOMAIN";

  const selectedSubDomain =
    subDomains.find(
      (item) =>
        String(item.value) === String(subDomainId)
    )?.label || "SUBDOMAIN";

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-8">
      {/* LEFT */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label={isEditMode ? "Domain (Cannot be changed)" : "Domain"} htmlFor="domain">
            <SelectField
              id="domain"
              value={String(domainId || "")}
              onChange={(v) => setFieldValue("domainId", Number(v))}
              options={domains}
              disabled={isEditMode}
            />
            {isEditMode && (
              <p className="text-xs text-amber-600 mt-1">
                Domain cannot be changed. Create a new program if you need a different domain.
              </p>
            )}
            {getIn(errors, "domainId") && (
              <p className="text-sm text-red-500 mt-1">{String(getIn(errors, "domainId"))}</p>
            )}
          </InputGroup>

          <InputGroup label={isEditMode ? "Sub Domain (Cannot be changed)" : "Sub Domain"} htmlFor="subDomain">
            <SelectField
              id="subDomain"
              value={String(subDomainId || "")}
              onChange={(v) => setFieldValue("subDomainId", Number(v))}
              options={subDomains}
              disabled={isEditMode}
            />
            {isEditMode && (
              <p className="text-xs text-amber-600 mt-1">
                Sub Domain cannot be changed. Create a new program if you need a different sub domain.
              </p>
            )}
            {getIn(errors, "subDomainId") && (
              <p className="text-sm text-red-500 mt-1">{String(getIn(errors, "subDomainId"))}</p>
            )}
          </InputGroup>
        </div>

        <InputGroup label="Program Title" htmlFor="title">
          <input
            id="title"
            value={title || ""}
            onChange={(e) => setFieldValue("title", e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="e.g. UX Research Fundamentals"
          />

          {getIn(errors, "title") && <p className="text-sm text-red-500 mt-1">{String(getIn(errors, "title"))}</p>}
        </InputGroup>

        <InputGroup label="Description" htmlFor="description">
          <TextAreaField
            id="description"
            rows={5}
            value={description || ""}
            onChange={(v) => setFieldValue("description", v)}
            placeholder="Describe the goals, curriculum, and expectations..."
          />

          {getIn(errors, "description") && (
            <p className="text-sm text-red-500 mt-1">{String(getIn(errors, "description"))}</p>
          )}
        </InputGroup>

        <InputGroup label="Program Image (Optional)">
          <label className="w-full border-2 border-dashed border-gray-200 rounded-2xl px-5 py-6 flex items-center gap-4 cursor-pointer hover:border-primary transition">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud size={22} />
            </div>

            <div>
              <p className="font-medium text-slateInk">
                Click to upload image
              </p>

              <p className="text-sm text-gray-400">
                PNG, JPG up to 5MB
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </InputGroup>
      </div>

      {/* RIGHT */}
      <div className="rounded-2xl bg-[#F8F9FC] p-5 flex justify-center items-start">
        <ExtraProgramCard
          variant="main"
          className="w-full max-w-sm"
          image={
            previewImage ||
            existingImageUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
          }
          tag={selectedDomain}
          subDomains={[selectedSubDomain]}
          title={title || "Program Title Preview"}
          description={
            description ||
            "Your program description will appear here as you type."
          }
          author={{
            avatar: "https://i.pravatar.cc/100?img=12",
            name: mentor
              ? `${mentor.firstName} ${mentor.lastName ?? ""}`
              : "Mentor Name",
          }}
          primaryButtonText="Apply"
        />
      </div>
    </div>
  );
}

import type {
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

type Props = {
  register: UseFormRegister<any>;
  values: any;
  setValue: UseFormSetValue<any>;
};

const domains = [
  { id: 1, name: "Technology" },
  { id: 2, name: "Business" },
  { id: 3, name: "Design" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "AI" },
];

export default function CommunityFormFields({
  register,
  values,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* LEFT */}
      <div className="space-y-5">
        {/* Domain */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Domain
          </label>

          <select
            {...register("domainId")}
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-primary"
          >
            <option value="">
              Select domain
            </option>

            {domains.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Community Name
          </label>

          <input
            {...register("name")}
            placeholder="Enter community name"
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Description
          </label>

          <textarea
            {...register("description")}
            rows={5}
            placeholder="Tell members what this community is about..."
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none resize-none focus:border-primary"
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Cover Image URL
          </label>

          <input
            {...register("coverImageUrl")}
            placeholder="Paste cover image URL"
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="rounded-3xl border border-gray-200 bg-[#F8F9FC] p-5">
        <div
          className="h-44 rounded-2xl bg-cover bg-center"
          style={{
            backgroundImage: values.coverImageUrl
              ? `url(${values.coverImageUrl})`
              : undefined,
          }}
        />

        <div className="mt-5">
          <span className="inline-flex rounded-md bg-[#F0ECFB] px-3 py-1 text-xs font-semibold text-primary">
            {
              domains.find(
                (d) =>
                  String(d.id) ===
                  values.domainId
              )?.name || "Domain"
            }
          </span>

          <h3 className="mt-4 text-2xl font-bold text-slateInk line-clamp-2">
            {values.name ||
              "Community Name"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-4">
            {values.description ||
              "Your community preview will appear here while typing."}
          </p>

          <button className="mt-6 h-11 w-full rounded-xl bg-primary text-white font-semibold">
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
}

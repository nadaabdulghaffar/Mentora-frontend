import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ModerationQueue } from "../../components/moderation/ModerationQueue";
import { ModerationDetail } from "../../components/moderation/ModerationDetail";
import { useModerationQueue } from "../../hooks/useModeration";
import type { ModerationQueueFilterParams } from "../../types/admin.types";

export const ModerationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("selectedId");

  const [filterParams, setFilterParams] = useState<ModerationQueueFilterParams>({
    pageNumber: 1,
    pageSize: 20,
    status: undefined, // Defaults to Open implicitly, but let the component handle it
  });

  const { data: queueData, isLoading: queueLoading, isError: queueError } = useModerationQueue(filterParams);

  const handleSelect = (id: string) => {
    setSearchParams({ selectedId: id });
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-50/30">
      {/* Left Pane: Queue List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 h-full max-h-[calc(100vh-64px)]">
        <ModerationQueue
          data={queueData?.data}
          isLoading={queueLoading}
          isError={queueError}
          params={filterParams}
          onParamsChange={setFilterParams}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* Right Pane: Details */}
      <div className="flex-1 h-full max-h-[calc(100vh-64px)] overflow-hidden bg-white">
        <ModerationDetail selectedId={selectedId} />
      </div>
    </div>
  );
};

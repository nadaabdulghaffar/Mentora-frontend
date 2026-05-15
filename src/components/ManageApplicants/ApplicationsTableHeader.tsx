export default function ApplicationsTableHeader() {
  return (
    <div className="grid grid-cols-6 px-6 py-3 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
      <span className="pl-2">Name</span>
      <span className="pl-4">Applied Date</span>
      <span className="pl-6">Level</span>
      <span className="pl-6">Program</span>
      <span className="pl-6">Status</span>
      <span></span>
    </div>
  );
}
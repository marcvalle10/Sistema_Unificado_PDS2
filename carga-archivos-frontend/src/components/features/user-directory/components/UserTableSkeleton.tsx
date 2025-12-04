export function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto px-2 sm:px-6 lg:px-[45px]">
      <table className="w-full min-w-[450px] table-fixed">
        <thead className="bg-[#2E4258] text-white">
          <tr className="flex w-full">
            <th className="flex-[0_0_5%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 text-left">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-sm animate-pulse"></div>
            </th>
            <th className="flex-[0_0_45%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 text-left">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
            </th>
            <th className="flex-[0_0_20%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 text-left hidden md:flex">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
            </th>
            <th className="flex-[0_0_20%] md:flex-[0_0_20%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 text-left md:flex">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
            </th>
            <th className="flex-[0_0_10%] md:flex-[0_0_10%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 text-left md:flex">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr
              key={index}
              className={`flex w-full border-b border-gray-200 ${
                index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-[#F3F8FF]"
              }`}
            >
              <td className="flex-[0_0_5%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-sm animate-pulse border-[1px] border-gray-300"></div>
              </td>
              <td className="flex-[0_0_45%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24 md:hidden"></div>
                  </div>
                </div>
              </td>
              <td className="flex-[0_0_20%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 hidden md:flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              </td>
              <td className="flex-[0_0_20%] md:flex-[0_0_20%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </td>
              <td className="flex-[0_0_10%] md:flex-[0_0_10%] px-2 sm:px-2 lg:px-2 py-1 sm:py-1 flex items-center">
                <div className="flex items-center justify-end w-full space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VideoConverter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Converter</h1>
          <p className="text-slate-400 mt-2">Convert and optimize your videos for any platform.</p>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer group">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>
        </div>
        <p className="text-xl font-medium">Select Videos</p>
        <p className="text-slate-500 mt-2">or drag and drop files here</p>
      </div>
    </div>
  );
}

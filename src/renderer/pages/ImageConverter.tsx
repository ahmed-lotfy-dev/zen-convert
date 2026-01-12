export default function ImageConverter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Converter</h1>
          <p className="text-slate-400 mt-2">Convert and optimize your images with ease.</p>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer group">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </div>
        <p className="text-xl font-medium">Select Images</p>
        <p className="text-slate-500 mt-2">or drag and drop files here</p>
      </div>
    </div>
  );
}

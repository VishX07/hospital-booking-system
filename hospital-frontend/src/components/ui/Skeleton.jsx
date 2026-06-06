import React from 'react';

const Skeleton = () => {
  return (
    <div className="min-h-[70vh] bg-slate-50 p-6 animate-pulse">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-64 rounded-lg bg-slate-200"></div>
          <div className="mt-3 h-4 w-40 rounded bg-slate-200"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="mt-4 h-8 w-16 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-40 rounded bg-slate-200"></div>
            <div className="h-72 rounded-xl bg-slate-200"></div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-32 rounded bg-slate-200"></div>

            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

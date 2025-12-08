import React from 'react';
import { TimelineEvent } from '../types';
import { Sprout, Factory, Amphora, Truck, Store, CheckCircle2 } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

const getIcon = (type: string) => {
  switch (type) {
    case 'harvest': return <Sprout className="w-5 h-5" />;
    case 'press': return <Factory className="w-5 h-5" />;
    case 'bottle': return <Amphora className="w-5 h-5" />; // Using Amphora as proxy for bottle/container
    case 'shipping': return <Truck className="w-5 h-5" />;
    case 'store': return <Store className="w-5 h-5" />;
    default: return <CheckCircle2 className="w-5 h-5" />;
  }
};

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative border-l-2 border-olive-200 ml-4 md:ml-6 space-y-12 my-8">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-8 md:pl-12 group">
          {/* Node Icon */}
          <div className="absolute -left-[11px] top-0 bg-stone-50 border-2 border-olive-500 rounded-full p-1.5 text-olive-700 transition-transform duration-300 group-hover:scale-110 group-hover:bg-olive-50">
            {getIcon(event.icon)}
          </div>
          
          {/* Content Card */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between bg-white p-5 rounded-lg shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-olive-600 mb-1 block">
                {event.date}
              </span>
              <h3 className="text-lg font-serif font-semibold text-stone-900 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-stone-500 mb-2 flex items-center gap-1">
                <span className="font-medium">Location:</span> {event.location}
              </p>
              <p className="text-stone-700 leading-relaxed text-sm">
                {event.description}
              </p>
            </div>
            
            {/* Blockchain Verification Badge */}
            <div className="mt-4 md:mt-0 md:ml-6 flex items-center md:flex-col md:items-end gap-2 text-xs text-stone-400">
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-semibold">Verified</span>
              </div>
              <span className="font-mono text-[10px] break-all max-w-[150px] text-right opacity-60">
                Tx: {event.hash.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

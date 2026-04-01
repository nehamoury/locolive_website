import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface HighlightItem {
    id: string;
    title: string;
    cover_url: string;
}

interface HighlightsProps {
    highlights?: HighlightItem[];
    onAdd?: () => void;
    onView?: (id: string) => void;
    isOwnProfile?: boolean;
}

const Highlights: FC<HighlightsProps> = ({ highlights = [], onAdd, onView, isOwnProfile }) => {
    return (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4 px-1">
            {isOwnProfile && (
                <button
                    onClick={onAdd}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                    <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-all duration-300">
                        <Plus className="w-5 h-5 text-primary/50 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">New</span>
                </button>
            )}

            {highlights.map((item, idx) => (
                <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => onView?.(item.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                    <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/10 group-active:scale-95 transition-transform">
                        <div className="w-full h-full rounded-full bg-white p-[2px]">
                            <img
                                src={item.cover_url.startsWith('http') ? item.cover_url : `http://localhost:8080${item.cover_url}`}
                                alt={item.title}
                                className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-black/80 truncate w-16 text-center uppercase tracking-wider">{item.title}</span>
                </motion.button>
            ))}

            {highlights.length === 0 && !isOwnProfile && (
                <div className="h-20" /> // Spacer
            )}
        </div>
    );
};

export default Highlights;

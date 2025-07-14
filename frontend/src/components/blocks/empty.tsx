import { Frown } from 'lucide-react';

interface PageProps {
    title: string;
    description: string;
}

export default function EmptySkeleton ({title, description}: PageProps) {
    return (
        <div className="text-center py-15 rounded-lg border border-dashed border-accent bg-accent/30">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-accent/60 mb-4">
                <Frown className="w-8 h-8 bg-accent/30" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">{title}</p>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
    );
}
import { SofaIcon, ArmchairIcon, RockingChairIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SeatModeBadgeProps {
    mode: string;
}

export const SeatModeBadge: React.FC<SeatModeBadgeProps> = ({ mode }) => {
    const getIcon = (mode: string) => {
        switch (mode) {
            case "first":
                return <SofaIcon className="mr-1" />;
            case "business":
                return <ArmchairIcon className="mr-1" />;
            case "economy":
                return <RockingChairIcon className="mr-1" />;
            default:
                return null;
        }
    };

    return (
        <Badge variant="outline" className="capitalize">
            {getIcon(mode)}
            <span className="capitalize">{mode}</span>
        </Badge>
    );
};

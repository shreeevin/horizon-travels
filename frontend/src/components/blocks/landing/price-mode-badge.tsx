import { Plane, Bus, RailSymbol } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceModeBadgeProps {
    mode: string;
    amount: number;
}

export const PriceModeBadge: React.FC<PriceModeBadgeProps> = ({ mode, amount }) => {
    const getIcon = (mode: string) => {
        switch (mode) {
            case "air":
                return <Plane className="mr-1" />;
            case "coach":
                return <Bus className="mr-1" />;
            case "train":
                return <RailSymbol className="mr-1" />;
            default:
                return null;
        }
    };

    return (
        <Badge variant="outline" className="capitalize">
            {getIcon(mode)}
            £{amount}
        </Badge>
    );
};

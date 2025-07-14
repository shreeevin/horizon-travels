import { SofaIcon, ArmchairIcon, RockingChairIcon } from "lucide-react";

export type SeatTypeName = 'economy' | 'business' | 'first';

export interface SeatOption {
    label: string;
    value: SeatTypeName;
    icon: React.ElementType;
}

export const seatOptions: SeatOption[] = [
    { label: "Economy", value: "economy", icon: RockingChairIcon },
    { label: "Business", value: "business", icon: ArmchairIcon },
    { label: "First", value: "first", icon: SofaIcon },
];
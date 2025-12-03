import { SimplifiedEvent } from "./eventConverters";

export interface IDataExport {
    backgroundColor: string;
    roundingValue: number;
    roundSplits: boolean;
    availablePhases: string[];
    templates: SimplifiedEvent[];
}
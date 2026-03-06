declare module 'node-excel-export' {
    interface CellStyle {
        font?: {
            sz?: number;
            bold?: boolean;
            [key: string]: any;
        };
        [key: string]: any;
    }

    interface ColumnSpecification {
        displayName: string;
        headerStyle?: CellStyle;
        cellStyle?: CellStyle | ((value: any, record: any) => CellStyle);
        cellFormat?: (value: any, record: any) => any;
        width?: number | string;
    }

    interface Specification {
        [key: string]: ColumnSpecification;
    }

    interface SheetConfig {
        cols?: Array<{ wpx?: number; wch?: number | string }>;
    }

    interface Merge {
        [key: string]: any;
    }

    interface SheetData {
        name?: string;
        specification: Specification;
        data: any[];
        heading?: any[][];
        merges?: Merge[];
        config?: SheetConfig;
    }

    export function buildExport(sheets: SheetData[]): Buffer;
}

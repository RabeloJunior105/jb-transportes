import { ZodSchema } from "zod";

export type Option = { label: string; value: string };

export type BaseFieldType =
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "hidden";

export type RemoteSelectType = "remote-select";

export type FieldType = BaseFieldType | RemoteSelectType;

export type RemoteSource = {
    table: string;
    valueKey: string;    // ex: "id"
    labelKey: string;    // ex: "plate" | "name"
    searchKeys?: string[];
    userScoped?: boolean;
    extraFilter?: Record<string, string | number | boolean | null>;
    pageSize?: number;   // default 10
};

export type FieldConfig = {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    options?: ReadonlyArray<Option>; // "select" estático
    remote?: RemoteSource;           // "remote-select"
};

export type GroupConfig = {
    title: string;
    description?: string;
    hidden?: boolean;
    fields: ReadonlyArray<FieldConfig>;
};

export type TypeHint = "number" | "date" | "string" | "boolean" | "uuid";

export type FormErrors = Record<string, string | undefined>;

export interface RecordFormProps {
    config: {
        title: string;
        description?: string;
        groups: ReadonlyArray<GroupConfig>;
    };
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    backHref?: string;
    schema?: ZodSchema<any>;
    typeHints?: Record<string, TypeHint>;
}

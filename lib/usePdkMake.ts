"use client";

import { useEffect, useState } from "react";

export function usePdfMake() {
    const [pdfMake, setPdfMake] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const pdfmakeModule = await import("pdfmake/build/pdfmake");
            const pdfFonts = await import("pdfmake/build/vfs_fonts");
            (pdfmakeModule as any).vfs = (pdfFonts as any).pdfMake.vfs;
            setPdfMake(pdfmakeModule);
        })();
    }, []);

    return pdfMake;
}

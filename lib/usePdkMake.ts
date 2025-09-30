"use client";

import { useEffect, useState } from "react";

export function usePdfMake() {
    const [pdfMake, setPdfMake] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const pdfmakeModule = await import("pdfmake/build/pdfmake");
            const pdfFonts = await import("pdfmake/build/vfs_fonts");

            const pdf = (pdfmakeModule as any).default || pdfmakeModule;

            if (pdf && !pdf.vfs) {
                pdf.vfs = (pdfFonts as any).pdfMake.vfs;
            }

            setPdfMake(pdf);
        })();
    }, []);

    return pdfMake;
}

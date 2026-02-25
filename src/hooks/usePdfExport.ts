import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export function usePdfExport() {
    const targetRef = useRef<HTMLDivElement>(null);

    const exportPdf = useCallback(async (filename = 'dashboard_report.pdf') => {
        if (!targetRef.current) {
            toast.error('Nothing to export');
            return;
        }

        toast.info('Generating PDF...');

        try {
            const canvas = await html2canvas(targetRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20; // 10mm margin each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10; // top margin

            // First page
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Additional pages if content is long
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
            toast.success('PDF downloaded!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to generate PDF');
        }
    }, []);

    return { targetRef, exportPdf };
}

/**
 * Utility for generating and downloading reports
 */

export const generateCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create blobs and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const generateAuditReport = () => {
    // Mock data for the audit pack
    const data = [
        {
            Periodo: '2024-01',
            Tipo: 'DJ 1887',
            Estado: 'Aceptada',
            Folio: '123456',
            Monto: 1500000
        },
        {
            Periodo: '2024-02',
            Tipo: 'F29',
            Estado: 'Aceptada',
            Folio: '123457',
            Monto: 230000
        },
        {
            Periodo: '2024-03',
            Tipo: 'F29',
            Estado: 'Aceptada',
            Folio: '123458',
            Monto: 450000
        }
    ];

    generateCSV(data, `audit_report_${new Date().toISOString().split('T')[0]}.csv`);
};

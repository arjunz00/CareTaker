import { useState } from 'react';

export function useReports() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmail = () => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr).email;
      } catch (e) {
        return "savita.sharma@gmail.com";
      }
    }
    return "savita.sharma@gmail.com";
  };

  const downloadExcelReport = async () => {
    setDownloading(true);
    setError(null);
    try {
      const email = getEmail();
      const url = `/api/patient/reports/excel?email=${encodeURIComponent(email)}`;
      
      // Perform simple fetch file download
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to compile Excel spreadsheet.");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `AegisNet_Health_Record_${email}_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to download Excel report.");
      return false;
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloading,
    error,
    downloadExcelReport
  };
}

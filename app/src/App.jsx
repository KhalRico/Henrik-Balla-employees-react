import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults([]);
    setCurrentPage(1);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8888/api/import/IdentifyPairEmployees",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setResults(result.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    }
  };

  const allRows = results
    .map((pair) => {
      const totalDays = pair.daysWorkedInProjects.reduce(
        (sum, p) => sum + p.daysWorked,
        0
      );
      return pair.daysWorkedInProjects.map((proj) => ({
        firstEmployeeId: pair.firstEmployeeId,
        secondEmployeeId: pair.secondEmployeeId,
        projectId: proj.projectId,
        daysWorked: proj.daysWorked,
      }));
    })
    .flat();

  allRows.sort((a, b) => b.totalDaysForPair - a.totalDaysForPair);

  const totalItems = allRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = allRows.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 3) end = 5;
    if (currentPage >= totalPages - 2) start = totalPages - 4;

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={{ padding: "20px", maxWidth: "960px", margin: "0 auto" }}>
      <h2>Employee Pairs Calculator</h2>

      <div style={{ marginBottom: "20px" }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "12px" }}>
          Upload
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div style={{ marginBottom: "12px", fontSize: "0.95em" }}>
            Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems} records
            <br />
            <small>(sorted by total days worked together – descending)</small>
          </div>

          <table
            border="1"
            cellPadding="8"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "16px",
            }}
          >
            <thead>
              <tr>
                <th>Employee ID #1</th>
                <th>Employee ID #2</th>
                <th>Project Id</th>
                <th>Days Worked</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.firstEmployeeId}</td>
                  <td>{row.secondEmployeeId}</td>
                  <td>{row.projectId}</td>
                  <td>{row.daysWorked}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: "8px 16px" }}
              >
                Previous
              </button>

              <div style={{ display: "flex", gap: "6px" }}>
                {pageNumbers.map((page, idx) => (
                  <button
                    key={`${page}-${idx}`}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                    style={{
                      padding: "8px 12px",
                      minWidth: "36px",
                      background:
                        page === currentPage
                          ? "#007bff"
                          : page === "..."
                          ? "transparent"
                          : "#f0f0f0",
                      color:
                        page === currentPage
                          ? "white"
                          : page === "..."
                          ? "#666"
                          : "black",
                      border:
                        page === "..." ? "none" : "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: page === "..." ? "default" : "pointer",
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: "8px 16px" }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
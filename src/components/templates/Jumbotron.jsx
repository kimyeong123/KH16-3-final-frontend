import { TbLabelImportant, TbSchool } from "react-icons/tb";

export default function Jumbotron({ subject = "제목", detail = "" }) {
  return (
    <div className="row mt-4">
      <div className="col">
        <div
          className="p-5 rounded shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0b0c0cff, #FFFFFF)", 
            borderRadius: "1rem",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
            fontFamily: "'Arial', sans-serif",
          }}
        >
          <h1
            className="d-flex align-items-center gap-3 mb-3"
            style={{
              color: "#2C3E50",
              fontWeight: "700",
              fontSize: "2.5rem",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)", 
            }}
          >
            {subject}
          </h1>

          <h4
            className="d-flex align-items-center gap-2"
            style={{
              color: "#34495E", 
              fontWeight: "500",
              fontSize: "1.25rem",
            }}
          >
            {detail}
          </h4>
        </div>
      </div>
    </div>
  );
}

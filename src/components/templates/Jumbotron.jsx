import { TbLabelImportant, TbSchool } from "react-icons/tb";
import "./Jumbotron.css";

export default function Jumbotron({ subject = "제목", detail = "" }) {
  return (
    <div className="row mt-4">
      <div className="col">
        <div className="jumbotron-card">
          <h1>
            {subject}
          </h1>
          <h4>
            {detail}
          </h4>
        </div>
      </div>
    </div>
  );
}
